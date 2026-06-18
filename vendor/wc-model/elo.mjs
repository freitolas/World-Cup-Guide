// Elo + Dixon-Coles bivariate Poisson — the match model behind https://cup26matches.com
// References: World Football Elo; Maher (1982); Dixon & Coles (1997).
export const K_FACTOR_WC = 60;

// Dixon-Coles ρ — corrects vanilla Poisson's under-count of 0-0 / 1-1 draws. ~ -0.13 empirically.
export const DC_RHO = -0.13;

function dcTau(a, b, lambda, mu, rho) {
  if (a === 0 && b === 0) return 1 - lambda * mu * rho;
  if (a === 0 && b === 1) return 1 + lambda * rho;
  if (a === 1 && b === 0) return 1 + mu * rho;
  if (a === 1 && b === 1) return 1 - rho;
  return 1;
}

// Elo win expectancy (logistic on rating difference).
export function expectedScore(ratingA, ratingB, homeBonusA = 0) {
  return 1 / (1 + Math.pow(10, (ratingB - (ratingA + homeBonusA)) / 400));
}

// Rating difference → expected goals (Poisson λ). Flat denominator keeps single-match variance
// near real football upset frequency.
//
// CALIBRATION (re-tuned 2026-06 against the played group games): the original
// 1.35 base / 350 spread was over-confident — it predicted draws at ~22% while
// ~30–40% of games actually drew, and over-spread blowouts. A lower base and
// flatter slope lift draw mass and exact-score accuracy. See docs/PREDICTION_ENGINE.md
// and scripts/calibrate-sweep.mjs for the evidence behind these two numbers.
export const GOALS_BASE = 1.25;   // baseline goals for an evenly-matched side
export const GOALS_SPREAD = 450;  // Elo points per +1.0 expected goal (higher = flatter / more draws)
export function expectedGoals(rating, opponent, homeBonus = 0) {
  const diff = (rating + homeBonus) - opponent;
  const lambda = GOALS_BASE + diff / GOALS_SPREAD;
  return Math.max(0.3, Math.min(3.5, lambda));
}

export function poissonPmf(k, lambda) {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  let p = Math.exp(-lambda);
  for (let i = 1; i <= k; i++) p *= lambda / i;
  return p;
}

export function poissonSample(lambda, rng = Math.random) {
  const L = Math.exp(-lambda);
  let k = 0, p = 1;
  do { k++; p *= rng(); } while (p > L);
  return k - 1;
}

// 1X2 probabilities via Dixon-Coles bivariate Poisson over 0–8 goals each side.
export function matchProb(ratingA, ratingB, homeBonusA = 0) {
  const lambda = expectedGoals(ratingA, ratingB, homeBonusA);
  const mu = expectedGoals(ratingB, ratingA, -homeBonusA / 2);
  let winA = 0, draw = 0, winB = 0;
  for (let a = 0; a <= 8; a++) {
    const pA = poissonPmf(a, lambda);
    for (let b = 0; b <= 8; b++) {
      const tau = dcTau(a, b, lambda, mu, DC_RHO);
      const p = pA * poissonPmf(b, mu) * tau;
      if (a > b) winA += p; else if (a < b) winB += p; else draw += p;
    }
  }
  const total = winA + draw + winB;
  return { winA: winA / total, draw: draw / total, winB: winB / total, expectedGoalsA: lambda, expectedGoalsB: mu };
}

// The most likely exact scoreline under the Dixon-Coles bivariate Poisson,
// optionally restricted to cells matching `pred(a,b)` (e.g. only home wins).
export function modalScore(ratingA, ratingB, homeBonusA = 0, pred = null) {
  const lambda = expectedGoals(ratingA, ratingB, homeBonusA);
  const mu = expectedGoals(ratingB, ratingA, -homeBonusA / 2);
  let best = { p: -1, a: 0, b: 0 };
  for (let a = 0; a <= 8; a++) {
    const pa = poissonPmf(a, lambda);
    for (let b = 0; b <= 8; b++) {
      if (pred && !pred(a, b)) continue;
      const p = pa * poissonPmf(b, mu) * dcTau(a, b, lambda, mu, DC_RHO);
      if (p > best.p) best = { p, a, b };
    }
  }
  return [best.a, best.b];
}

// How close the draw probability must be to the favourite's win probability for
// THE AI to commit to a draw. The unrestricted modal CELL over-commits to 1–1
// (goals cluster at 1 and DC ρ inflates the draw), so we instead pick the OUTCOME
// from the 1X2 distribution — draw only when it's genuinely competitive — then the
// most likely scoreline WITHIN that outcome. Tunable; see scripts/calibrate-sweep
// and docs/PREDICTION_ENGINE.md §4.
export const DRAW_MARGIN = Number(process.env.DRAW_MARGIN ?? 0.20);

// THE AI's single committed scoreline. Stable name for callers (update.mjs,
// friendlies.mjs). Outcome-first, then modal scoreline within the outcome.
export function pickScore(ratingA, ratingB, homeBonusA = 0, drawMargin = DRAW_MARGIN) {
  const p = matchProb(ratingA, ratingB, homeBonusA);
  const favWin = Math.max(p.winA, p.winB);
  // Commit to a draw only when it's the top outcome or within drawMargin of it.
  if (p.draw >= favWin - drawMargin) return modalScore(ratingA, ratingB, homeBonusA, (a, b) => a === b);
  return p.winA >= p.winB
    ? modalScore(ratingA, ratingB, homeBonusA, (a, b) => a > b)
    : modalScore(ratingA, ratingB, homeBonusA, (a, b) => a < b);
}

// Sample a scoreline (for Monte Carlo). allowDraw=false → penalty shootout nudge toward higher Elo.
export function sampleMatch(ratingA, ratingB, homeBonusA = 0, allowDraw = true, rng = Math.random) {
  const eA = expectedGoals(ratingA, ratingB, homeBonusA);
  const eB = expectedGoals(ratingB, ratingA, -homeBonusA / 2);
  let goalsA = poissonSample(eA, rng);
  let goalsB = poissonSample(eB, rng);
  if (!allowDraw && goalsA === goalsB) {
    if (rng() < expectedScore(ratingA, ratingB, homeBonusA)) goalsA += 1; else goalsB += 1;
  }
  return { goalsA, goalsB };
}
