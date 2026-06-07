// ISOLATED warm-up predictions. The bot predicts upcoming international
// friendlies so there's live content to market before the World Cup.
//
// HARD ISOLATION: friendly results NEVER feed the World Cup ratings/predictions.
// Predictions here are computed from the model's static calibrated Elo only, and
// written to their own file (src/data/friendlies.json). Nothing here touches
// results.json / predictions.json / botPicks.json.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { matchProb, expectedGoals, poissonPmf, DC_RHO } from '../../vendor/wc-model/elo.mjs';

const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY || '';
// Confirm the right id from the discovery log, then pin it via env if needed.
const FRIENDLIES_LEAGUE_ID = process.env.FRIENDLIES_LEAGUE_ID || '10';
const SEASON = process.env.FRIENDLIES_SEASON || String(new Date().getUTCFullYear());
const FRIENDLY_HOME_ADV = 30; // modest — friendlies are often neutral/low-stakes
const log = (...a) => console.log('[friendlies]', ...a);

const calibrated = JSON.parse(
  readFileSync(fileURLToPath(new URL('../../vendor/wc-model/data/elo-calibrated.json', import.meta.url)), 'utf8'),
).ratings;

const slugify = (s) =>
  (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const ALIAS = {
  'united-states': 'usa', 'ivory-coast': 'cote-divoire', 'czech-republic': 'czechia',
  'bosnia-and-herzegovina': 'bosnia', turkiye: 'turkey', 'korea-republic': 'south-korea',
};
function ratingFor(name) {
  let s = slugify(name);
  s = ALIAS[s] || s;
  return calibrated[s] != null ? { slug: s, elo: calibrated[s] } : null;
}

function dcTau(a, b, l, m, r) {
  if (a === 0 && b === 0) return 1 - l * m * r;
  if (a === 0 && b === 1) return 1 + l * r;
  if (a === 1 && b === 0) return 1 + m * r;
  if (a === 1 && b === 1) return 1 - r;
  return 1;
}
function modalScore(rh, ra, hb) {
  const l = expectedGoals(rh, ra, hb);
  const m = expectedGoals(ra, rh, -hb / 2);
  let best = [0, 0]; let bp = -1;
  for (let a = 0; a <= 8; a++) for (let b = 0; b <= 8; b++) {
    const p = poissonPmf(a, l) * poissonPmf(b, m) * dcTau(a, b, l, m, DC_RHO);
    if (p > bp) { bp = p; best = [a, b]; }
  }
  return best;
}
const r3 = (x) => Math.round(x * 1000) / 1000;
const r1 = (x) => Math.round(x * 100) / 100;

async function af(path) {
  const res = await fetch(`https://v3.football.api-sports.io/${path}`, {
    headers: { 'x-apisports-key': API_FOOTBALL_KEY },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()).response || [];
}

async function discover() {
  try {
    const r = await af('leagues?search=friendlies');
    log(`friendlies leagues: ${r.map((x) => `${x.league.id}:${x.league.name}`).slice(0, 8).join(' | ') || 'none'}`);
  } catch (e) {
    log(`league discovery failed: ${e.message}`);
  }
}

// Returns { updated, source, fixtures:[...] } or null (no key / error) so the
// caller can leave any existing friendlies.json untouched.
export async function buildFriendlies(now = new Date()) {
  if (!API_FOOTBALL_KEY) { log('no API_FOOTBALL_KEY — skipping friendlies'); return null; }
  try {
    await discover();
    const from = new Date(now.getTime() - 10 * 864e5).toISOString().slice(0, 10);
    const to = new Date(now.getTime() + 21 * 864e5).toISOString().slice(0, 10);
    const fx = await af(`fixtures?league=${FRIENDLIES_LEAGUE_ID}&season=${SEASON}&from=${from}&to=${to}`);

    const fixtures = [];
    let unrated = 0;
    for (const f of fx) {
      const hN = f.teams?.home?.name;
      const aN = f.teams?.away?.name;
      const rh = ratingFor(hN);
      const ra = ratingFor(aN);
      if (!rh || !ra) { unrated++; continue; } // can't predict without ratings for both
      const p = matchProb(rh.elo, ra.elo, FRIENDLY_HOME_ADV);
      const rec = {
        id: `F${f.fixture.id}`,
        date: (f.fixture.date || '').slice(0, 10),
        kickoff: f.fixture.date,
        home: rh.slug, away: ra.slug, homeName: hN, awayName: aN,
        prediction: { win: r3(p.winA), draw: r3(p.draw), loss: r3(p.winB), eg: [r1(p.expectedGoalsA), r1(p.expectedGoalsB)] },
        botPick: modalScore(rh.elo, ra.elo, FRIENDLY_HOME_ADV),
      };
      const ft = f.score?.fulltime;
      if (f.fixture?.status?.short === 'FT' && ft && ft.home != null) rec.result = { hg: ft.home, ag: ft.away };
      fixtures.push(rec);
    }
    fixtures.sort((a, b) => String(a.kickoff).localeCompare(String(b.kickoff)));
    log(`predictable: ${fixtures.length} | skipped (unrated team): ${unrated} | window ${from}..${to}`);
    return { updated: new Date().toISOString(), source: 'api-football', fixtures };
  } catch (e) {
    log(`error — leaving friendlies.json untouched: ${e.message}`);
    return null;
  }
}
