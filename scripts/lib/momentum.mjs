// Momentum & morale layer — the PSYCHOLOGICAL overlay on top of skill.
//
// Skill (Elo, in ratings.mjs) answers "how good is this team?" and is permanent.
// Morale answers "what frame of mind do they ARRIVE in?" for their very next
// match, and it is temporary and fades. The two are deliberately kept separate so
// a result is never double-counted (once as skill, once as confidence).
//
// HOW IT READS a team's recent matches (World Cup results + run-up friendlies):
//   • Each past match is scored by SURPRISE = actual − expected, where expected
//     comes from the Elo gap. Beating/holding a stronger side is a confidence
//     boost; dropping points you were expected to take adds pressure. This is the
//     "held Spain → morale up, Spain rattled" effect, captured automatically
//     because surprise is bigger the stronger the opponent.
//   • A MASSIVE HUMILIATION (lose by ≥3, or concede ≥4 in a loss) is a heavy fixed
//     hit on top of surprise — "like losing a star" — per the design.
//   • RECENCY: the most recent match counts most; older ones decay geometrically.
//   • COMPETITION: World Cup matches count ~2.5× a friendly, but friendlies still
//     count as the run-up picture. (NOTE: this is the one deliberate exception to
//     friendlies.mjs's "friendlies never touch WC numbers" rule — and it only
//     touches the transient morale overlay, never the skill Elo.)
//
// OUTPUT: signed Elo deltas per team (positive = arrives confident → effectively
// stronger; negative = arrives under pressure → weaker), plus human-readable
// reasons for the lock notification. Magnitudes are capped so normal morale is a
// gentle nudge and only extremes (humiliation / giant-killing) reach star-level.

import { expectedScore } from '../../vendor/wc-model/elo.mjs';
import { teams } from '../../src/data/teams.js';

// ── tunables (see docs/PREDICTION_ENGINE.md → "Tuning the morale layer") ──────
const LAST_N = 10;            // matches of history considered
const DECAY = 0.72;           // recency weight = DECAY^age (0 = most recent)
const WC_WEIGHT = 2.5;        // a World Cup match counts this many friendlies
const FRIENDLY_WEIGHT = 1.0;
const SURPRISE_GAIN = 55;     // Elo per unit of (result − expected); result∈{0,0.5,1}
const HUMILIATION_GD = 3;     // lose by ≥ this many goals …
const HUMILIATION_GA = 4;     // … or concede ≥ this many in a loss → humiliated
const HUMILIATION_HIT = 25;   // extra morale damage applied to a humiliation
const MORALE_CAP = 50;        // hard clamp on |morale|, ≈ a key suspension

const name = Object.fromEntries(teams.map((t) => [t.id, t.name]));

/**
 * @param {Record<string,number>} ratings  current Elo per slug (skill only)
 * @param {object} opts
 * @param {Record<string,{home,away,hg,ag,date,status}>} opts.wcResults  results.json shape
 * @param {Array<{home,away,result?:{hg,ag},date}>} opts.friendlies      friendlies.json fixtures
 * @param {string} [opts.asOf]  ISO date 'YYYY-MM-DD'; only matches strictly BEFORE
 *                              this are used (walk-forward backtests). Omit = all.
 * @returns {{morale: Record<string,number>, reasons: Record<string,string[]>}}
 */
export function computeMomentum(ratings, { wcResults = {}, friendlies = [], asOf = null } = {}) {
  const before = (d) => asOf == null || String(d) < String(asOf);
  const hist = {}; // slug -> [{date, opp, gf, ga, isWC}]
  const push = (team, opp, gf, ga, date, isWC) => {
    if (ratings[team] == null || ratings[opp] == null) return; // need both ratings to judge surprise
    if (gf == null || ga == null || !before(date)) return;
    (hist[team] ||= []).push({ date, opp, gf, ga, isWC });
  };

  for (const r of Object.values(wcResults)) {
    if (r.status !== 'played') continue;
    push(r.home, r.away, r.hg, r.ag, r.date, true);
    push(r.away, r.home, r.ag, r.hg, r.date, true);
  }
  for (const f of friendlies) {
    if (!f.result) continue;
    push(f.home, f.away, f.result.hg, f.result.ag, f.date, false);
    push(f.away, f.home, f.result.ag, f.result.hg, f.date, false);
  }

  const morale = {};
  const reasons = {};
  for (const [team, all] of Object.entries(hist)) {
    all.sort((a, b) => String(b.date).localeCompare(String(a.date))); // newest first
    const recent = all.slice(0, LAST_N);
    // WEIGHTED AVERAGE of per-match morale contributions. Competition + recency set
    // how much each match COUNTS toward the average; they do NOT inflate the final
    // magnitude (so "WC counts 2.5×" means it dominates the read, not that morale
    // is 2.5× larger). Keeps morale in natural Elo-of-surprise units, capped ±50.
    let num = 0, den = 0;
    let driver = null; // biggest single contributor, for the reason string
    recent.forEach((m, i) => {
      const result = m.gf > m.ga ? 1 : m.gf < m.ga ? 0 : 0.5;
      const exp = expectedScore(ratings[team], ratings[m.opp]); // no home adv in the morale read
      let contrib = SURPRISE_GAIN * (result - exp);
      const humiliated = m.gf < m.ga && ((m.ga - m.gf) >= HUMILIATION_GD || m.ga >= HUMILIATION_GA);
      if (humiliated) contrib -= HUMILIATION_HIT;
      const weight = Math.pow(DECAY, i) * (m.isWC ? WC_WEIGHT : FRIENDLY_WEIGHT);
      num += contrib * weight;
      den += weight;
      if (!driver || Math.abs(contrib * weight) > Math.abs(driver.eff)) driver = { ...m, result, exp, eff: contrib * weight, humiliated };
    });

    const clamped = Math.max(-MORALE_CAP, Math.min(MORALE_CAP, Math.round(den ? num / den : 0)));
    if (clamped === 0 || !driver) continue;
    morale[team] = clamped;

    // human-readable reason, anchored on the strongest recent match
    const opp = name[driver.opp] || driver.opp;
    const verb = driver.gf > driver.ga ? `beat ${opp} ${driver.gf}–${driver.ga}`
      : driver.gf < driver.ga ? `lost ${driver.gf}–${driver.ga} to ${opp}`
      : `drew ${driver.gf}–${driver.ag ?? driver.ga} with ${opp}`;
    const flavour = driver.humiliated ? 'a chastening result'
      : driver.result - driver.exp > 0.15 ? 'above expectations'
      : driver.result - driver.exp < -0.15 ? 'below expectations'
      : 'as expected';
    const mood = clamped > 0 ? `arrives confident (+${clamped})` : `arrives under pressure (${clamped})`;
    reasons[team] = [`morale — ${mood}; recently ${verb} (${flavour}${driver.isWC ? ', WC' : ', friendly'})`];
  }

  return { morale, reasons };
}
