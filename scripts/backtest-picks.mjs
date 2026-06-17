// Walk-forward backtest of pick MECHANICS against the played group games.
//
// For each played fixture we rebuild ratings from ONLY the results before its
// date (causal / out-of-sample), then generate a committed scoreline under each
// candidate mechanic and score it. No news here — suspensions/injuries can't be
// faithfully reconstructed historically in-container — so this isolates the
// MECHANIC. (The news layer's effect is analysed separately; see the report.)
//
//   node scripts/backtest-picks.mjs
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { matches } from '../src/data/matches.js';
import { teams } from '../src/data/teams.js';
import { buildRatings, HOSTS, HOME_ADV } from './lib/ratings.mjs';
import { expectedGoals, poissonPmf, matchProb, DC_RHO } from '../vendor/wc-model/elo.mjs';

const root = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const name = Object.fromEntries(teams.map((t) => [t.id, t.name]));
const byId = Object.fromEntries(matches.map((m) => [m.id, m]));

const results = JSON.parse(readFileSync(root('src/data/results.json'), 'utf8'));
const frozen = existsSync(root('src/data/botPicks.json'))
  ? JSON.parse(readFileSync(root('src/data/botPicks.json'), 'utf8')) : {};

// ── chronological played list, oriented to OUR home/away ───────────────────
const played = Object.entries(results)
  .filter(([, r]) => r.status === 'played' && r.hg != null)
  .map(([id, r]) => ({ id, home: r.home, away: r.away, hg: r.hg, ag: r.ag, date: r.date }))
  .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));

// ── exact-scoreline probability grid (Dixon-Coles bivariate Poisson) ───────
const dcTau = (a, b, l, m, rho) =>
  a === 0 && b === 0 ? 1 - l * m * rho
  : a === 0 && b === 1 ? 1 + l * rho
  : a === 1 && b === 0 ? 1 + m * rho
  : a === 1 && b === 1 ? 1 - rho : 1;

function grid(rh, ra, hb) {
  const l = expectedGoals(rh, ra, hb);
  const m = expectedGoals(ra, rh, -hb / 2);
  const cells = [];
  let total = 0;
  for (let a = 0; a <= 8; a++) for (let b = 0; b <= 8; b++) {
    const p = poissonPmf(a, l) * poissonPmf(b, m) * dcTau(a, b, l, m, DC_RHO);
    cells.push({ a, b, p });
    total += p;
  }
  return cells.map((c) => ({ ...c, p: c.p / total }));
}

// deterministic per-match RNG (mulberry32 seeded by id) so chaos is reproducible
const seed = (s) => { let h = 1779033703 ^ s.length; for (let i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; }; };

// ── variants: (rh, ra, hb, id) -> [a, b] ───────────────────────────────────
const VARIANTS = {
  // current production mechanic: round the mean, break draws toward the favourite
  chalk(rh, ra, hb) {
    let a = Math.round(expectedGoals(rh, ra, hb));
    let b = Math.round(expectedGoals(ra, rh, -hb / 2));
    if (a === b) { const p = matchProb(rh, ra, hb); if (p.winA - p.winB > 0.05) a++; else if (p.winB - p.winA > 0.05) b++; }
    return [a, b];
  },
  // #1 honour the draw when it's the modal 1X2 outcome; else chalk
  drawHonor(rh, ra, hb) {
    const p = matchProb(rh, ra, hb);
    if (p.draw >= p.winA && p.draw >= p.winB) { const d = Math.max(0, Math.round((p.expectedGoalsA + p.expectedGoalsB) / 2)); return [d, d]; }
    let a = Math.round(p.expectedGoalsA); let b = Math.round(p.expectedGoalsB);
    if (a === b) { if (p.winA > p.winB) a++; else b++; }
    return [a, b];
  },
  // #2 the modal exact scoreline of the full distribution (the "simulation" the brand claims)
  simMode(rh, ra, hb) {
    const c = grid(rh, ra, hb).reduce((m, x) => (x.p > m.p ? x : m));
    return [c.a, c.b];
  },
  // #3 chaos dial: temperature-flattened distribution, deterministically sampled per match
  chaos(rh, ra, hb, id, T = 1.6) {
    const cells = grid(rh, ra, hb).map((c) => ({ ...c, w: Math.pow(c.p, 1 / T) }));
    const tot = cells.reduce((s, c) => s + c.w, 0);
    let r = seed(id + 'chaos')() * tot;
    for (const c of cells) { r -= c.w; if (r <= 0) return [c.a, c.b]; }
    const c = cells[cells.length - 1]; return [c.a, c.b];
  },
};

// ── scoring ────────────────────────────────────────────────────────────────
const out = (h, a) => (h > a ? 1 : h < a ? -1 : 0);
function grade(pick, hg, ag) {
  if (pick[0] === hg && pick[1] === ag) return { tag: 'EXACT', pts: 3 };
  if (out(pick[0], pick[1]) === out(hg, ag)) return { tag: 'RIGHT', pts: 1 };
  return { tag: 'WRONG', pts: 0 };
}

// ── run walk-forward ────────────────────────────────────────────────────────
const names = ['frozen', ...Object.keys(VARIANTS)];
const tally = Object.fromEntries(names.map((n) => [n, { exact: 0, right: 0, wrong: 0, pts: 0, n: 0 }]));
const rows = [];

for (const f of played) {
  const before = played.filter((g) => g.date < f.date);
  const { ratings } = buildRatings(before.map((g) => ({ homeSlug: g.home, awaySlug: g.away, hg: g.hg, ag: g.ag, date: g.date })));
  const rh = ratings[f.home]; const ra = ratings[f.away];
  if (rh == null || ra == null) continue;
  const hb = HOSTS.has(f.home) ? HOME_ADV : 0;

  const picks = { frozen: frozen[f.id] || null };
  for (const [k, fn] of Object.entries(VARIANTS)) picks[k] = fn(rh, ra, hb, f.id);

  const row = { id: f.id, label: `${name[f.home]} v ${name[f.away]}`, res: `${f.hg}-${f.ag}`, picks: {} };
  for (const k of names) {
    const pk = picks[k];
    if (!pk) { row.picks[k] = '  —  '; continue; }
    const g = grade(pk, f.hg, f.ag);
    tally[k].exact += g.tag === 'EXACT'; tally[k].right += g.tag === 'RIGHT'; tally[k].wrong += g.tag === 'WRONG';
    tally[k].pts += g.pts; tally[k].n++;
    row.picks[k] = `${pk[0]}-${pk[1]} ${g.tag[0]}`;
  }
  rows.push(row);
}

// ── report ──────────────────────────────────────────────────────────────────
const pad = (s, n) => String(s).padEnd(n);
console.log('\nWALK-FORWARD BACKTEST — picks rebuilt from only prior results (no news)\n');
console.log(pad('match', 26) + pad('actual', 8) + names.map((n) => pad(n, 11)).join(''));
for (const r of rows) console.log(pad(r.label.slice(0, 25), 26) + pad(r.res, 8) + names.map((n) => pad(r.picks[n], 11)).join(''));

console.log('\nSUMMARY (exact=3pts, correct outcome=1pt, wrong=0)\n');
console.log(pad('variant', 12) + pad('n', 4) + pad('exact', 7) + pad('right', 7) + pad('wrong', 7) + pad('outcome%', 10) + 'points');
for (const k of names) {
  const t = tally[k]; if (!t.n) continue;
  const okPct = ((t.exact + t.right) / t.n * 100).toFixed(0) + '%';
  console.log(pad(k, 12) + pad(t.n, 4) + pad(t.exact, 7) + pad(t.right, 7) + pad(t.wrong, 7) + pad(okPct, 10) + t.pts);
}
console.log('\nLegend: E=EXACT, R=RIGHT(outcome), W=WRONG. "frozen" = the picks actually posted.');
