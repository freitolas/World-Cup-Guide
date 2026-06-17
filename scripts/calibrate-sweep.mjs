// Best-next-test: is THE AI overconfident, and does flattening the goal spread
// lift hit-rate? Sweeps ONE theoretically-grounded knob — the rating→goals
// steepness D in  λ = 1.35 + Δrating/D  (bigger D = flatter = more draws/upsets) —
// walk-forward over the played games, reporting OUTCOME hit-rate (argmax W/D/L),
// exact/outcome via the modal scoreline, predicted-vs-actual DRAW rate
// (calibration), and Brier (a proper score, more stable than hit-count at n=16).
//
//   node scripts/calibrate-sweep.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { teams } from '../src/data/teams.js';
import { buildRatings, HOSTS, HOME_ADV } from './lib/ratings.mjs';

const root = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const results = JSON.parse(readFileSync(root('src/data/results.json'), 'utf8'));

const played = Object.entries(results)
  .filter(([, r]) => r.status === 'played' && r.hg != null)
  .map(([id, r]) => ({ id, home: r.home, away: r.away, hg: r.hg, ag: r.ag, date: r.date }))
  .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));

const DC_RHO = Number(process.env.RHO || -0.13);
const BASE = Number(process.env.BASE || 1.35);
const poissonPmf = (k, l) => { if (l <= 0) return k === 0 ? 1 : 0; let p = Math.exp(-l); for (let i = 1; i <= k; i++) p *= l / i; return p; };
const dcTau = (a, b, l, m, rho) =>
  a === 0 && b === 0 ? 1 - l * m * rho : a === 0 && b === 1 ? 1 + l * rho
  : a === 1 && b === 0 ? 1 + m * rho : a === 1 && b === 1 ? 1 - rho : 1;

// tunable expected goals (D = spread steepness)
const eg = (r, o, hb, D) => Math.max(0.3, Math.min(3.5, BASE + ((r + hb) - o) / D));

function model(rh, ra, hb, D) {
  const l = eg(rh, ra, hb, D);
  const m = eg(ra, rh, -hb / 2, D);
  let winA = 0, draw = 0, winB = 0, best = { p: -1, a: 0, b: 0 };
  for (let a = 0; a <= 8; a++) for (let b = 0; b <= 8; b++) {
    const p = poissonPmf(a, l) * poissonPmf(b, m) * dcTau(a, b, l, m, DC_RHO);
    if (a > b) winA += p; else if (a < b) winB += p; else draw += p;
    if (p > best.p) best = { p, a, b };
  }
  const t = winA + draw + winB;
  return { winA: winA / t, draw: draw / t, winB: winB / t, mode: [best.a, best.b] };
}

const out = (h, a) => (h > a ? 'H' : h < a ? 'A' : 'D');
const obsDraws = played.filter((g) => g.hg === g.ag).length;

const Ds = [250, 300, 350, 400, 500, 650, 800, 1000];
console.log(`\nDRAW-CALIBRATION SWEEP — walk-forward over ${played.length} played games`);
console.log(`Observed draw rate: ${obsDraws}/${played.length} = ${(obsDraws / played.length * 100).toFixed(0)}%   (current production D=350)\n`);
const pad = (s, n) => String(s).padEnd(n);
console.log(pad('D', 6) + pad('predDraw%', 11) + pad('outHit%(argmax)', 16) + pad('outHit%(mode)', 15) + pad('exact(mode)', 13) + 'Brier');

for (const D of Ds) {
  let predDraw = 0, hitArg = 0, hitMode = 0, exact = 0, brier = 0, n = 0;
  for (const f of played) {
    const before = played.filter((g) => g.date < f.date);
    const { ratings } = buildRatings(before.map((g) => ({ homeSlug: g.home, awaySlug: g.away, hg: g.hg, ag: g.ag, date: g.date })));
    const rh = ratings[f.home], ra = ratings[f.away];
    if (rh == null || ra == null) continue;
    const hb = HOSTS.has(f.home) ? HOME_ADV : 0;
    const p = model(rh, ra, hb, D);
    const actual = out(f.hg, f.ag);
    // argmax W/D/L
    const arg = p.winA >= p.draw && p.winA >= p.winB ? 'H' : p.winB >= p.draw ? 'A' : 'D';
    // modal scoreline outcome
    const modeOut = out(p.mode[0], p.mode[1]);
    const y = { H: actual === 'H' ? 1 : 0, D: actual === 'D' ? 1 : 0, A: actual === 'A' ? 1 : 0 };
    predDraw += p.draw;
    hitArg += arg === actual;
    hitMode += modeOut === actual;
    exact += (p.mode[0] === f.hg && p.mode[1] === f.ag);
    brier += (p.winA - y.H) ** 2 + (p.draw - y.D) ** 2 + (p.winB - y.A) ** 2;
    n++;
  }
  console.log(
    pad(D, 6) + pad((predDraw / n * 100).toFixed(0) + '%', 11) +
    pad((hitArg / n * 100).toFixed(0) + '%', 16) + pad((hitMode / n * 100).toFixed(0) + '%', 15) +
    pad(`${exact}/${n}`, 13) + (brier / n).toFixed(3),
  );
}
console.log('\nLower Brier = better-calibrated probabilities. predDraw% should track the observed draw rate.');
