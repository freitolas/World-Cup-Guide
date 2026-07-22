# World Cup 2026 — Tournament Retrospective & Lessons Learned

**Project:** THE AI ("humans are inferior") — an autonomous bot that predicted every
2026 World Cup match, froze a committed scoreline before kickoff, posted a three-beat
narrative to X, and rendered its record on humansareinferior.com.

**Status: STOPPED.** The tournament ended 2026-07-19. All scheduled/triggered activity
is disabled (see [How everything was stopped](#how-everything-was-stopped)). This
document is the final tally and the honest post-mortem.

---

## 1. Final tally

### Predictions (frozen picks vs. actual results)

| Metric | Result |
|---|---|
| Fixtures graded | **87** |
| Correct outcome (W/D/L) | **52 — 60%** |
| Exact scoreline | **14 — 16%** |
| Wrong | 35 — 40% |
| Points (exact = 3, outcome = 1) | **80** (0.92 / game) |

**Draw calibration (the thing we fought all tournament):**

| | value |
|---|---|
| Actual draws | 25 / 87 (**29%**) |
| Draws predicted | 24 |
| Draws correctly called | 9 / 25 (36% recall) |

The headline win: after the mid-tournament recalibration the bot's **draw *rate* matched
reality almost exactly (24 predicted vs. 25 actual)** — a model that at the start of the
tournament predicted essentially *zero* draws while ~30–40% of games drew. Getting the
*rate* right is what the outcome-first fix (`DRAW_MARGIN`) delivered; getting the exact
draws *right* (recall) remains hard — that's football.

Context: **60% outcome accuracy** on 87 matches is a solid result for a lightweight
Elo + Dixon-Coles Poisson model with news/morale overlays. **16% exact** sits near the
practical ceiling for exact-score prediction in football (good public models land
~15–18%).

### Posting

| Beat | Count |
|---|---|
| Beat 1 — the dare (pre-match) | 83 |
| Beat 2 — the locked pick (≤15 min before KO) | 71 |
| Beat 3 — the result/brag (full time) | 71 |
| **Total tweets** | **225** |
| Complete 3-beat cycles | **71** |
| Matches touched | 117 |

The Beat-1 → Beat-2 gap (83 → 71) is the fingerprint of the early **cron-throttling era**:
the dare fired, but the time-critical locked pick often missed its window until Make.com
took over the clock. Once it did, Beat 2 and Beat 3 track each other perfectly (71 = 71),
because the honesty rule (Beat 3 only if Beat 2 actually posted) held.

---

## 2. How the engine evolved during the tournament

The system did **not** start where it finished. The arc:

1. **Naïve baseline.** Static Elo → round the expected goals → post. Over-confident,
   never predicted draws, and the marketing ("ten-million simulations") didn't match the
   code (a deterministic mean-round).
2. **Kickoff-time fix.** A date-crossing bug fired a pick ~24h early; tweets were
   retracted. Kickoffs were being treated as naïve UTC.
3. **Reliability moved off GitHub cron** to a Make.com `workflow_dispatch` clock after
   logs proved GitHub was firing ~6–9 of a requested ~112 scheduled runs/day.
4. **Recalibration** of the goal model (`GOALS_BASE`, `GOALS_SPREAD`) once ~20 games of
   evidence showed systematic draw under-prediction — validated by Brier, not vibes.
5. **Momentum/morale layer** added: a psychological overlay from recent form (WC-weighted,
   humiliation-penalised, decaying), kept strictly separate from skill Elo.
6. **News-signal cache** to fix preview/lock inconsistency caused by NewsData volatility.
7. **Draw over-correction fix** — the modal-*cell* pick was predicting 44% draws
   (including 55%-favourites as 1–1); switched to **outcome-first** picking with a tunable
   `DRAW_MARGIN`, landing the ~29% final draw rate.

Full mechanics: [`docs/PREDICTION_ENGINE.md`](docs/PREDICTION_ENGINE.md).

---

## 3. Lessons learned

### Technical

1. **Time zones are not optional.** Storing kickoffs as naïve UTC caused a night game to
   roll to the wrong day and a pick to fire a day early. *Store tz-aware kickoffs and
   validate every fixture against the source feed.*
2. **Don't trust `cron:` for time-critical work.** GitHub throttles scheduled workflows
   hard (and worst at high frequency). A 15-minute pre-kickoff window is unhittable that
   way. *An external clock hitting `workflow_dispatch` (Make.com) was the fix* — and the
   completion rate jumped as a result.
3. **Calibrate against reality, not intuition.** The model was confidently wrong about
   draws for weeks. A proper score (**Brier**) and a **walk-forward backtest** surfaced it;
   opinion never would have. Track the proper score over time, don't re-tune on each result.
4. **Beware the metric that rewards overfitting.** On the early, unusually draw-heavy
   sample (40%), the raw modal-cell pick "scored" best — then predicted 44% draws live and
   called clear favourites to draw. *Optimise toward the generalising behaviour (the live
   draw rate), not the tiny-sample high score.* The final 29% actual draw rate vindicated it.
5. **Pick the outcome, then the scoreline — not the single most-likely cell.** The most
   probable *exact scoreline* can be a draw even when a *win* is far more likely once summed
   over all winning scorelines. Aggregate first.
6. **Cache volatile external signals.** NewsData returns only the latest ~10 articles and
   churns; a single poll is not ground truth. A TTL cache made the preview and the locked
   pick consistent and stopped signals flickering in and out.
7. **Separate orthogonal signals cleanly.** Skill (earned, permanent Elo) vs. morale
   (fleeting, decaying) had to be kept distinct or a single result got double-counted.
8. **Know your billing model.** Per-job-minute rounding makes high-frequency dispatch
   expensive on private repos; the same runs are free on a public repo.

### Process / product

9. **Immutability was the right architectural bet.** Frozen picks that never regenerate
   let the bot honestly claim "I never change my mind" *and* made grading unambiguous.
10. **Make the brand claim true.** "Ten-million simulations" over a deterministic
    mean-round is a liability; aligning the implementation with the story is both honest
    and, here, more accurate.
11. **Cheap validation harnesses pay for themselves.** The walk-forward backtests caught
    that two "obvious" fixes were net-neutral, and that the outcome-first change actually
    generalised — before anything shipped.
12. **Reliability and correctness should be designed in from day one**, not patched
    mid-tournament. Both the cron and the time-zone issues were foreseeable.

### What I'd do differently next time
- Tz-correct kickoffs and an external scheduler from commit #1.
- Start from a **calibrated** model (fit base scoring rate + draw mass to historical rates)
  instead of an over-confident default.
- Track Brier live from the first matchday; treat the first ~15 games as non-diagnostic.
- Consider a dedicated exact-scoreline calibration — 16% is fine but is the one number the
  model never really optimised for.

---

## How everything was stopped

- **`data-pipeline.yml`** — `schedule:` cron removed **and** job guarded `if: false`
  (no more results/predictions/freezing/deploys).
- **`x-poster.yml`** — job guarded `if: false` (Make may still dispatch, but every run
  skips instantly; no more posting).
- **`preview-picks.yml`** — job guarded `if: false` (no more Telegram digests / cache writes).
- **`x-delete.yml`** — manual-only, left as-is (never auto-runs).

**Two owner actions to fully wind down** (I can't reach these from the repo):
1. **Turn off / pause the Make.com scenarios** (the x-poster clock and the daily preview
   trigger) so they stop poking the now-skipped workflows.
2. Optionally disable the workflows in the GitHub **Actions** tab for good measure.

**To ever re-run it:** delete the `if: false` lines (and restore the data-pipeline cron
or dispatch it manually).
