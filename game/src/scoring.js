// Deterministic scoring — IDENTICAL for the human and for THE AI (Game brief §6).
//
//   Exact scoreline ............ 5
//   Correct result + goal diff .. 3
//   Correct result only ......... 1
//   Wrong ....................... 0
//
// "Closer" is rewarded in tiers, and the same function scores both sides.

export const POINTS = { exact: 5, goalDiff: 3, result: 1, miss: 0 };

export const outcome = (h, a) => (h > a ? 1 : h < a ? -1 : 0);

export function scorePick(pick, result) {
  if (!pick || !result) return 0;
  const [ph, pa] = pick;
  const { hg, ag } = result;
  if (ph === hg && pa === ag) return POINTS.exact;
  if (outcome(ph, pa) === outcome(hg, ag)) {
    if (ph - pa === hg - ag) return POINTS.goalDiff;
    return POINTS.result;
  }
  return POINTS.miss;
}

// Head-to-head tally over every resolved match in scope.
// FORFEIT RULE (brief §5b): if the human made no pick, they score 0 for that
// match but THE AI still scores its frozen pick. No exclusions.
export function tally(scope, picks, results, botPicks) {
  let you = 0;
  let ai = 0;
  let played = 0;
  let forfeits = 0;
  for (const m of scope) {
    const r = results[m.id];
    if (!r) continue;
    played += 1;
    const human = picks[m.id] || null;
    if (!human) forfeits += 1;
    you += scorePick(human, r);
    ai += scorePick(botPicks[m.id] || null, r);
  }
  return { you, ai, played, forfeits };
}
