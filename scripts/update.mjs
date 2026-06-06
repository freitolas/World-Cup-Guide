#!/usr/bin/env node
// Daily update: pull results from openfootball, refresh win/draw/loss predictions
// from the vendored model, and (optionally) rebuild + commit for auto-deploy.
//
//   node scripts/update.mjs            regenerate data + rebuild site
//   node scripts/update.mjs --commit   ...then commit & push (auto-deploys)
//   node scripts/update.mjs --no-build  data only, skip the Vite build
//
// Design rule: this must never hard-fail. If the feed is unreachable we keep the
// last good results; if the model errors we fall back to a rank-based estimate
// and label those predictions "estimated" so they're never passed off as real.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { matches } from '../src/data/matches.js';
import { teams } from '../src/data/teams.js';
import { matchProb, expectedScore, expectedGoals, poissonPmf, DC_RHO } from '../vendor/wc-model/elo.mjs';
import { buildRatings, HOSTS, HOME_ADV } from './lib/ratings.mjs';
import { nameToSlug, isPlaceholder, unmapped } from './lib/teamMap.mjs';

const OPENFOOTBALL = 'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json';
const root = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const RESULTS_FILE = root('src/data/results.json');
const PREDICTIONS_FILE = root('src/data/predictions.json');
const BOTPICKS_FILE = root('src/data/botPicks.json');

const args = new Set(process.argv.slice(2));
const log = (...a) => console.log('[update]', ...a);

// Unordered team-pair -> our match id (each pair meets once in the group stage).
const pairToId = new Map();
for (const m of matches) pairToId.set([m.home, m.away].sort().join('|'), m.id);
const byId = new Map(matches.map((m) => [m.id, m]));

async function fetchFixtures() {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(OPENFOOTBALL, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      log(`fetch attempt ${attempt} failed: ${err.message}`);
      if (attempt < 4) await new Promise((r) => setTimeout(r, 2 ** attempt * 1000));
    }
  }
  return null;
}

// Parse openfootball -> { results: {id: {...}}, playedForModel: [...] }.
function parseResults(feed) {
  const results = {};
  const playedForModel = [];
  const warnings = [];

  for (const m of feed.matches) {
    if (isPlaceholder(m.team1) || isPlaceholder(m.team2)) continue;
    if (unmapped(m.team1)) warnings.push(m.team1);
    if (unmapped(m.team2)) warnings.push(m.team2);

    const s1 = nameToSlug(m.team1);
    const s2 = nameToSlug(m.team2);
    if (!s1 || !s2) continue;

    const played = m.score && Array.isArray(m.score.ft);
    if (played) {
      // model nudge uses openfootball orientation (team1 = home)
      playedForModel.push({ homeSlug: s1, awaySlug: s2, hg: m.score.ft[0], ag: m.score.ft[1], date: m.date });
    }

    const id = pairToId.get([s1, s2].sort().join('|'));
    if (!id || !played) continue; // knockout slots aren't in our fixtures yet

    // Orient the score to OUR home/away.
    const our = byId.get(id);
    const [hg, ag] = our.home === s1 ? m.score.ft : [m.score.ft[1], m.score.ft[0]];
    results[id] = { status: 'played', home: our.home, away: our.away, hg, ag, date: m.date };
  }
  return { results, playedForModel, warnings: [...new Set(warnings)] };
}

function predictionsFor(ratings, source) {
  const out = {};
  for (const m of matches) {
    const rh = ratings[m.home];
    const ra = ratings[m.away];
    if (rh == null || ra == null) continue;
    const hb = HOSTS.has(m.home) ? HOME_ADV : 0;
    const p = matchProb(rh, ra, hb);
    out[m.id] = {
      win: round(p.winA),
      draw: round(p.draw),
      loss: round(p.winB),
      eg: [round1(p.expectedGoalsA), round1(p.expectedGoalsB)],
      source,
    };
  }
  return out;
}

const round = (x) => Math.round(x * 1000) / 1000;
const round1 = (x) => Math.round(x * 100) / 100;

// Dixon-Coles low-score correction (mirrors vendor/wc-model/elo.mjs, which keeps
// it private). Used to find THE AI's modal scoreline for the Game's bot picks.
function dcTau(a, b, lambda, mu, rho) {
  if (a === 0 && b === 0) return 1 - lambda * mu * rho;
  if (a === 0 && b === 1) return 1 + lambda * rho;
  if (a === 1 && b === 0) return 1 + mu * rho;
  if (a === 1 && b === 1) return 1 - rho;
  return 1;
}

// Most probable scoreline = mode of the DC bivariate-Poisson grid (0–8 each side).
function modalScore(ratingA, ratingB, homeBonusA = 0) {
  const lambda = expectedGoals(ratingA, ratingB, homeBonusA);
  const mu = expectedGoals(ratingB, ratingA, -homeBonusA / 2);
  let best = [0, 0];
  let bestP = -1;
  for (let a = 0; a <= 8; a++) {
    for (let b = 0; b <= 8; b++) {
      const p = poissonPmf(a, lambda) * poissonPmf(b, mu) * dcTau(a, b, lambda, mu, DC_RHO);
      if (p > bestP) {
        bestP = p;
        best = [a, b];
      }
    }
  }
  return best;
}

// Freeze THE AI's pick per fixture. Once a fixture has a pick it is NEVER
// regenerated — that immutability is what lets the bot honestly claim it never
// changes its mind (Game brief §3). Picks are the modal scoreline at first sight.
function freezeBotPicks(ratings, results) {
  const picks = existsSync(BOTPICKS_FILE)
    ? JSON.parse(readFileSync(BOTPICKS_FILE, 'utf8'))
    : {};
  let added = 0;
  if (ratings) {
    for (const m of matches) {
      if (picks[m.id]) continue; // frozen — never regenerate
      const rh = ratings[m.home];
      const ra = ratings[m.away];
      if (rh == null || ra == null) continue; // knockout slots not yet resolved
      const hb = HOSTS.has(m.home) ? HOME_ADV : 0;
      picks[m.id] = modalScore(rh, ra, hb);
      added++;
    }
  }
  writeFileSync(BOTPICKS_FILE, JSON.stringify(picks, null, 2) + '\n');
  log(`bot picks: ${Object.keys(picks).length} frozen (${added} new)`);

  // QA: every not-yet-played fixture with known teams must have a frozen pick.
  const missing = matches.filter(
    (m) =>
      !results[m.id] &&
      !picks[m.id] &&
      ratings &&
      ratings[m.home] != null &&
      ratings[m.away] != null,
  );
  if (missing.length) {
    log(`ERROR: ${missing.length} fixture(s) missing a bot pick: ${missing.map((m) => m.id).join(', ')}`);
    process.exitCode = 1;
  }
}

async function main() {
  // --- results ---
  let results = {};
  let playedForModel = [];
  const feed = await fetchFixtures();
  if (feed) {
    const parsed = parseResults(feed);
    results = parsed.results;
    playedForModel = parsed.playedForModel;
    if (parsed.warnings.length) log('WARN unmapped team names from feed:', parsed.warnings.join(', '));
    log(`feed ok — ${Object.keys(results).length} played group match(es)`);
  } else if (existsSync(RESULTS_FILE)) {
    results = JSON.parse(readFileSync(RESULTS_FILE, 'utf8'));
    log('feed unreachable — keeping last good results');
  } else {
    log('feed unreachable and no cached results — predictions only');
  }
  writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2) + '\n');

  // --- predictions (with graceful fallback) ---
  let predictions;
  let ratings = null;
  try {
    const built = buildRatings(playedForModel);
    ratings = built.ratings;
    if (built.gapFilled.length) log(`rank-filled ratings for: ${built.gapFilled.join(', ')}`);
    predictions = predictionsFor(ratings, 'model');
    log(`predictions: ${Object.keys(predictions).length} fixtures (model)`);
  } catch (err) {
    log(`MODEL FAILED (${err.message}) — falling back to rank estimate`);
    predictions = fallbackPredictions();
  }
  writeFileSync(PREDICTIONS_FILE, JSON.stringify(predictions, null, 2) + '\n');

  // --- bot picks (THE AI's frozen scoreline, consumed by the Game) ---
  freezeBotPicks(ratings, results);

  // --- build / commit ---
  if (!args.has('--no-build')) {
    log('building…');
    execSync('npm run build', { stdio: 'inherit', cwd: root('.') });
  }
  if (args.has('--commit')) {
    const stamp = new Date().toISOString().slice(0, 10);
    execSync('git add -A', { stdio: 'inherit', cwd: root('.') });
    try {
      execSync(`git commit -m "Daily update: results + predictions (${stamp})"`, { stdio: 'inherit', cwd: root('.') });
      execSync('git push', { stdio: 'inherit', cwd: root('.') });
    } catch {
      log('nothing to commit');
    }
  }
  log('done.');
}

// Engine-free estimate straight from FIFA rank — only used if the model throws.
function fallbackPredictions() {
  const rank = Object.fromEntries(teams.map((t) => [t.id, t.rank]));
  const eloFromRank = (r) => 2050 - 9 * r; // rough monotonic proxy
  const out = {};
  for (const m of matches) {
    if (rank[m.home] == null || rank[m.away] == null) continue;
    const hb = HOSTS.has(m.home) ? HOME_ADV : 0;
    const exp = expectedScore(eloFromRank(rank[m.home]), eloFromRank(rank[m.away]), hb);
    const draw = 0.26;
    out[m.id] = {
      win: round(exp * (1 - draw)),
      draw,
      loss: round((1 - exp) * (1 - draw)),
      eg: [null, null],
      source: 'estimated',
    };
  }
  return out;
}

main();
