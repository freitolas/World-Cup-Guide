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
import { matchProb, expectedScore, pickScore } from '../vendor/wc-model/elo.mjs';
import { buildRatings, HOSTS, HOME_ADV } from './lib/ratings.mjs';
import { nameToSlug, isPlaceholder, unmapped } from './lib/teamMap.mjs';
import { fetchContext } from './lib/context.mjs';
import { buildFriendlies } from './lib/friendlies.mjs';

const OPENFOOTBALL = 'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json';
const root = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const RESULTS_FILE = root('src/data/results.json');
const PREDICTIONS_FILE = root('src/data/predictions.json');
const BOTPICKS_FILE = root('src/data/botPicks.json');
const FRIENDLIES_FILE = root('src/data/friendlies.json');

const args = new Set(process.argv.slice(2));
const log = (...a) => console.log('[update]', ...a);

// Unordered team-pair -> our match id (each pair meets once in the group stage).
const pairToId = new Map();
for (const m of matches) pairToId.set([m.home, m.away].sort().join('|'), m.id);
const byId = new Map(matches.map((m) => [m.id, m]));
const teamLabel = new Map(teams.map((t) => [t.id, t.name]));

export async function fetchFixtures() {
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
export function parseResults(feed) {
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

// Kickoff time. Stored date+time are treated as UTC for now (refine when the
// official per-venue timezones are confirmed).
export const kickoffMs = (m) => new Date(`${m.date}T${m.time || '00:00'}:00Z`).getTime();
// Kickoff in UK local time (auto BST/GMT) — notifications go to the UK owner.
const ukTime = (ms) => new Date(ms).toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit' });

// How close to kickoff a pick is frozen. Picks are frozen LATE — only within
// this many hours of kickoff — so the freshest injuries/suspensions/news are
// baked in. The pipeline runs every ~3h, so each match freezes ~2-3h before ITS
// kickoff (not the day's first). Override with FREEZE_HORIZON_HOURS.
const FREEZE_HORIZON_HOURS = Number(process.env.FREEZE_HORIZON_HOURS || 5);
const FREEZE_QA_HOURS = 4; // a fixture this close with no pick = something broke

// Build a one-shot "pick locked" event for a newly frozen fixture, carrying the
// context REASON (suspensions/injuries/crisis) that shaped the pick — currently
// only visible in run logs. Consumed by the Make.com lock-notification scenario.
function summarizeReason(home, away, context) {
  const parts = [];
  if (home.signals.length) parts.push(`${home.label} −${home.penalty}: ${home.signals.join('; ')}`);
  if (away.signals.length) parts.push(`${away.label} −${away.penalty}: ${away.signals.join('; ')}`);
  if (parts.length) return `Context shaped the pick — ${parts.join(' | ')}.`;
  return (context && context.applied)
    ? 'No injury, suspension or crisis signals for either side — pick from base ratings (form & Elo).'
    : 'Context layer inactive this run — pick from base ratings (form & Elo).';
}

function buildFreezeEvent(m, pick, context, now) {
  const [hg, ag] = pick;
  const adj = (context && context.adjustments) || {};
  const rsn = (context && context.reasons) || {};
  const homeLabel = teamLabel.get(m.home) || m.home;
  const awayLabel = teamLabel.get(m.away) || m.away;
  const home = { team: m.home, label: homeLabel, penalty: adj[m.home] || 0, signals: rsn[m.home] || [] };
  const away = { team: m.away, label: awayLabel, penalty: adj[m.away] || 0, signals: rsn[m.away] || [] };
  const summary = summarizeReason(home, away, context);
  const kickoff = new Date(kickoffMs(m)).toISOString();
  return {
    type: 'pick_locked',
    match: m.id,
    fixture: `${homeLabel} v ${awayLabel}`,
    kickoff,
    pick: `${hg}-${ag}`,
    pickHome: hg,
    pickAway: ag,
    frozenAt: new Date(now).toISOString(),
    contextApplied: !!(context && context.applied),
    reason: { home, away, summary },
    text: `🔒 THE AI locked its pick: ${homeLabel} ${hg}–${ag} ${awayLabel} (kickoff ${ukTime(kickoffMs(m))} UK). ${summary}`,
  };
}

// Fire one notification per NEWLY frozen pick (lock + the context reason) to a
// Make.com webhook, if configured. Freezes are idempotent — a pick is added once
// and never regenerated — so each lock notifies exactly once. Never throws.
async function notifyFreezes(frozen) {
  if (!frozen || !frozen.length) return;
  const url = process.env.MAKE_FREEZE_WEBHOOK || '';
  if (!url) {
    log(`freeze notify: ${frozen.length} new lock(s), MAKE_FREEZE_WEBHOOK unset — skipping`);
    return;
  }
  for (const ev of frozen) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ev),
        signal: AbortSignal.timeout(15000),
      });
      log(`freeze notify ${ev.match}: HTTP ${res.status}`);
    } catch (e) {
      log(`freeze notify ${ev.match} failed: ${e.message}`);
    }
  }
}

// Freeze THE AI's pick per fixture, LATE (near kickoff) so context is included.
// Once a fixture has a pick it is NEVER regenerated — that immutability is what
// lets the bot honestly claim it never changes its mind (Game brief §3). The
// pick is pickScore() from ratings already adjusted for context (suspensions/
// injuries/crisis), so an upset shows up as a flipped scoreline.
function freezeBotPicks(ratings, results, context = null, now = Date.now()) {
  const picks = existsSync(BOTPICKS_FILE)
    ? JSON.parse(readFileSync(BOTPICKS_FILE, 'utf8'))
    : {};
  const frozen = [];
  let added = 0;
  let pending = 0;
  if (ratings) {
    for (const m of matches) {
      if (picks[m.id]) continue; // frozen — never regenerate
      if (results[m.id]) continue; // already played
      const rh = ratings[m.home];
      const ra = ratings[m.away];
      if (rh == null || ra == null) continue; // knockout slots not yet resolved

      const hoursOut = (kickoffMs(m) - now) / 3.6e6;
      if (hoursOut < 0 || hoursOut > FREEZE_HORIZON_HOURS) {
        if (hoursOut >= 0) pending++; // valid fixture, just not yet in the freeze window
        continue;
      }
      const hb = HOSTS.has(m.home) ? HOME_ADV : 0;
      picks[m.id] = pickScore(rh, ra, hb);
      added++;
      frozen.push(buildFreezeEvent(m, picks[m.id], context, now));
    }
  }
  writeFileSync(BOTPICKS_FILE, JSON.stringify(picks, null, 2) + '\n');
  log(`bot picks: ${Object.keys(picks).length} frozen (${added} new this run, ${pending} pending future fixtures)`);

  // QA: any fixture kicking off within the next few hours MUST already have a
  // frozen pick — otherwise a match could start with no committed prediction.
  const missing = matches.filter((m) => {
    if (results[m.id] || picks[m.id]) return false;
    if (!ratings || ratings[m.home] == null || ratings[m.away] == null) return false;
    const hoursOut = (kickoffMs(m) - now) / 3.6e6;
    return hoursOut >= 0 && hoursOut <= FREEZE_QA_HOURS;
  });
  if (missing.length) {
    log(`ERROR: ${missing.length} imminent fixture(s) missing a bot pick: ${missing.map((m) => m.id).join(', ')}`);
    process.exitCode = 1;
  }
  return { frozen };
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
  let context = null;
  try {
    const built = buildRatings(playedForModel);
    ratings = built.ratings;
    if (built.gapFilled.length) log(`rank-filled ratings for: ${built.gapFilled.join(', ')}`);

    // News & context layer: injuries/suspensions/crisis → rating adjustments.
    // Only spend the (rate-limited) news/football APIs when a fixture is actually
    // near the freeze window — most of the every-3h runs skip it.
    const ctxWindowMs = (FREEZE_HORIZON_HOURS + 1) * 3.6e6;
    const imminent = matches.some(
      (m) => !results[m.id] && ratings[m.home] != null && ratings[m.away] != null
        && kickoffMs(m) - Date.now() > 0 && kickoffMs(m) - Date.now() <= ctxWindowMs,
    );
    if (imminent) {
      context = await fetchContext();
      if (context.applied) {
        let n = 0;
        for (const [slug, penalty] of Object.entries(context.adjustments)) {
          if (ratings[slug] != null) { ratings[slug] -= penalty; n++; }
        }
        log(`context APPLIED — adjusted ${n} team rating(s)`);
      }
    } else {
      log('no fixture within the freeze window — skipping context APIs this run');
    }

    predictions = predictionsFor(ratings, 'model');
    log(`predictions: ${Object.keys(predictions).length} fixtures (model)`);
  } catch (err) {
    log(`MODEL FAILED (${err.message}) — falling back to rank estimate`);
    predictions = fallbackPredictions();
  }
  writeFileSync(PREDICTIONS_FILE, JSON.stringify(predictions, null, 2) + '\n');

  // --- bot picks (THE AI's frozen scoreline, consumed by the Game) ---
  const { frozen } = freezeBotPicks(ratings, results, context);
  await notifyFreezes(frozen);

  // --- friendlies (ISOLATED warm-up predictions; never affects WC data) ---
  const friendlies = await buildFriendlies();
  if (friendlies) {
    writeFileSync(FRIENDLIES_FILE, JSON.stringify(friendlies, null, 2) + '\n');
    log(`friendlies written: ${friendlies.fixtures.length} fixture(s)`);
  }

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

// Run the pipeline only when invoked directly (node scripts/update.mjs), not
// when imported for its helpers (e.g. by scripts/preview-picks.mjs).
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
