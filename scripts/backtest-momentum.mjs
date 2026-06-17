// Before/after backtest: OLD engine (1.35 base / 350 spread, round-the-mean +
// draw-break, no morale) vs NEW engine (1.15/450 modal scoreline + momentum/morale
// overlay), plus the FROZEN picks actually posted. Walk-forward: every fixture is
// predicted using only the results that preceded its date. See docs/PREDICTION_ENGINE.md.
//
//   node scripts/backtest-momentum.mjs
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { teams } from '../src/data/teams.js';
import { buildRatings, HOSTS, HOME_ADV } from './lib/ratings.mjs';
import { computeMomentum } from './lib/momentum.mjs';
import { pickScore } from '../vendor/wc-model/elo.mjs'; // NEW: modal + recalibrated

const root = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const name = Object.fromEntries(teams.map((t) => [t.id, t.name]));
const results = JSON.parse(readFileSync(root('src/data/results.json'), 'utf8'));
const friendlies = existsSync(root('src/data/friendlies.json'))
  ? JSON.parse(readFileSync(root('src/data/friendlies.json'), 'utf8')).fixtures || [] : [];
const frozen = existsSync(root('src/data/botPicks.json'))
  ? JSON.parse(readFileSync(root('src/data/botPicks.json'), 'utf8')) : {};

const played = Object.entries(results)
  .filter(([, r]) => r.status === 'played' && r.hg != null)
  .map(([id, r]) => ({ id, home: r.home, away: r.away, hg: r.hg, ag: r.ag, date: r.date }))
  .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));

// ── OLD engine (self-contained, frozen at the pre-change constants) ──────────
const RHO = -0.13;
const pmf = (k, l) => { if (l <= 0) return k === 0 ? 1 : 0; let p = Math.exp(-l); for (let i = 1; i <= k; i++) p *= l / i; return p; };
const tau = (a, b, l, m) => a === 0 && b === 0 ? 1 - l * m * RHO : a === 0 && b === 1 ? 1 + l * RHO : a === 1 && b === 0 ? 1 + m * RHO : a === 1 && b === 1 ? 1 - RHO : 1;
const oldEG = (r, o, hb) => Math.max(0.3, Math.min(3.5, 1.35 + ((r + hb) - o) / 350));
function oldPick(rh, ra, hb) {
  const l = oldEG(rh, ra, hb), m = oldEG(ra, rh, -hb / 2);
  let a = Math.round(l), b = Math.round(m);
  if (a === b) {
    let wa = 0, wb = 0;
    for (let x = 0; x <= 8; x++) for (let y = 0; y <= 8; y++) { const p = pmf(x, l) * pmf(y, m) * tau(x, y, l, m); if (x > y) wa += p; else if (x < y) wb += p; }
    if (wa - wb > 0.05) a++; else if (wb - wa > 0.05) b++;
  }
  return [a, b];
}

// ── scoring ──────────────────────────────────────────────────────────────────
const out = (h, a) => (h > a ? 1 : h < a ? -1 : 0);
const grade = (pk, hg, ag) => pk[0] === hg && pk[1] === ag ? { t: 'E', pts: 3 } : out(pk[0], pk[1]) === out(hg, ag) ? { t: 'R', pts: 1 } : { t: 'W', pts: 0 };
const variants = ['frozen', 'OLD', 'NEW'];
const tally = Object.fromEntries(variants.map((v) => [v, { E: 0, R: 0, W: 0, pts: 0, n: 0, drawHit: 0 }]));
const totalDraws = played.filter((g) => g.hg === g.ag).length;
const rows = [];

for (const f of played) {
  const before = played.filter((g) => g.date < f.date).map((g) => ({ homeSlug: g.home, awaySlug: g.away, hg: g.hg, ag: g.ag, date: g.date }));
  const { ratings } = buildRatings(before);
  if (ratings[f.home] == null || ratings[f.away] == null) continue;
  const hb = HOSTS.has(f.home) ? HOME_ADV : 0;

  // NEW: apply morale overlay (walk-forward, only matches before this date)
  const r2 = { ...ratings };
  const { morale } = computeMomentum(r2, { wcResults: results, friendlies, asOf: f.date });
  for (const [s, d] of Object.entries(morale)) if (r2[s] != null) r2[s] += d;

  const picks = {
    frozen: frozen[f.id] || null,
    OLD: oldPick(ratings[f.home], ratings[f.away], hb),
    NEW: pickScore(r2[f.home], r2[f.away], hb),
  };

  const row = { id: f.id, label: `${name[f.home]} v ${name[f.away]}`.slice(0, 24), res: `${f.hg}-${f.ag}`, c: {} };
  const isDraw = f.hg === f.ag;
  for (const v of variants) {
    const pk = picks[v];
    if (!pk) { row.c[v] = '  —  '; continue; }
    const g = grade(pk, f.hg, f.ag);
    const t = tally[v]; t[g.t]++; t.pts += g.pts; t.n++;
    if (isDraw && pk[0] === pk[1]) t.drawHit++;
    row.c[v] = `${pk[0]}-${pk[1]} ${g.t}`;
  }
  rows.push(row);
}

const pad = (s, n) => String(s).padEnd(n);
console.log('\nBEFORE/AFTER BACKTEST — walk-forward over the played group games\n');
console.log(pad('match', 25) + pad('actual', 8) + variants.map((v) => pad(v, 10)).join(''));
for (const r of rows) console.log(pad(r.label, 25) + pad(r.res, 8) + variants.map((v) => pad(r.c[v], 10)).join(''));
console.log('\nSUMMARY (exact=3pts, correct outcome=1pt)  —  E=exact R=right-outcome W=wrong\n');
console.log(pad('engine', 9) + pad('n', 4) + pad('exact', 7) + pad('right', 7) + pad('wrong', 7) + pad('outcome%', 10) + pad('points', 8) + `draws hit (of ${totalDraws})`);
for (const v of variants) {
  const t = tally[v]; if (!t.n) continue;
  console.log(pad(v, 9) + pad(t.n, 4) + pad(t.E, 7) + pad(t.R, 7) + pad(t.W, 7) + pad(((t.E + t.R) / t.n * 100).toFixed(0) + '%', 10) + pad(t.pts, 8) + t.drawHit);
}
