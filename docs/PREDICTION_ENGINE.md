# THE AI Prediction Engine — Full Reference

> **Read this before touching anything under `scripts/`, `scripts/lib/`, or
> `vendor/wc-model/`.** This document is the single source of truth for how THE
> AI ("humans are inferior") generates its World Cup 2026 predictions, how the
> news and morale layers shape them, when picks are frozen, and how they get
> posted. It is intentionally exhaustive so a fresh session can change the system
> without breaking it.

Last substantive update: 2026-06 (added the momentum/morale layer + recalibrated
the goal model). When you change behaviour, **update this file in the same commit.**

---

## 0. TL;DR — the one-paragraph mental model

Every team has a **skill rating** (Elo). Two transient overlays adjust that rating
just before a match: **news/context** (suspensions, injuries, crisis — gated on API
keys) and **momentum/morale** (psychological state from recent form — always on, no
keys). The adjusted ratings become an **effective strength** for each side; the
model turns the two strengths into a probability distribution over scorelines
(Dixon-Coles bivariate Poisson) and commits to the **single most likely scoreline**
(`pickScore`). Near kickoff that pick is **frozen forever** (`botPicks.json`) and
then **posted** to X in three beats. Predictions for the public site refresh every
run; frozen picks never change.

```
openfootball results ─┐
                      ▼
   ratings.mjs  ──►  base Elo skill (permanent, earned)
                      │
   context.mjs ──►   + news overlay (suspensions/injuries/crisis)   [needs keys, CONTEXT_ENABLED=1]
                      │
   momentum.mjs ──►  + morale overlay (recent form, WC-weighted)    [always on]
                      ▼
              effective strength per team
                      │
   elo.mjs ──►  matchProb (W/D/L %) + pickScore (modal scoreline)
                      │
        ┌─────────────┴───────────────┐
        ▼                              ▼
 predictions.json (site, live)   botPicks.json (FROZEN, immutable) ──► post-picks.mjs ──► X
```

---

## 1. File map

| Path | Role |
|---|---|
| `vendor/wc-model/elo.mjs` | The math: Elo→goals calibration, Dixon-Coles bivariate Poisson, `matchProb`, **`pickScore`/`modalScore`**. |
| `vendor/wc-model/data/elo-calibrated.json` | Static calibrated Elo ratings for ~39 teams (the skill prior). |
| `scripts/lib/ratings.mjs` | Builds a rating for all 48 finalists: calibrated where known, rank-regressed where not, then nudged by 2026 results. |
| `scripts/lib/context.mjs` | **News layer.** Suspensions (from cards), injuries, crisis → Elo penalties, player-importance weighted. API-gated. |
| `scripts/lib/momentum.mjs` | **Morale layer.** Recent-form psychology → signed Elo deltas. No APIs. |
| `scripts/lib/friendlies.mjs` | ISOLATED friendly-match predictions (marketing). Friendly *results* feed morale but **never** skill Elo. |
| `scripts/lib/teamMap.mjs` | openfootball name ↔ our slug mapping, placeholder detection. |
| `scripts/update.mjs` | **The pipeline.** Orchestrates results → ratings → news → morale → predictions → freeze → notify → friendlies → build/commit. Exports `fetchFixtures`, `parseResults`, `kickoffMs`. |
| `scripts/preview-picks.mjs` | No-freeze preview of upcoming picks (news + morale forced on). Posts a daily Telegram digest. Writes only the shared `news-signals.json` cache. |
| `scripts/post-picks.mjs` | The X auto-poster (three-beat cycle). Idempotent via `posted.json`. |
| `scripts/delete-tweets.mjs` | Manual tweet retraction by id. |
| `scripts/backtest-picks.mjs` | Walk-forward mechanic comparison (chalk/draw-honor/sim-mode/chaos). |
| `scripts/backtest-momentum.mjs` | Walk-forward **OLD vs NEW** (recalibration + morale) vs frozen. Run this after any model change. |
| `scripts/calibrate-sweep.mjs` | Sweeps `GOALS_BASE` / `GOALS_SPREAD` / `DC_RHO`, reports draw calibration + Brier. |
| `src/data/*.json` | Generated data (see §2). Treat as pipeline OUTPUT; the scheduled runner owns them. |

---

## 2. Data files (shapes)

All are written by the pipeline; do not hand-edit unless fixing corruption.

- **`results.json`** `{ [matchId]: { status:'played', home, away, hg, ag, date } }` — played group games, oriented to OUR home/away.
- **`predictions.json`** `{ [matchId]: { win, draw, loss, eg:[h,a], source } }` — site W/D/L %. `source` is `model` or `estimated` (fallback). **Regenerated every run.**
- **`botPicks.json`** `{ [matchId]: [hg, ag] }` — THE AI's **frozen** scorelines. **Append-only & immutable** (see §6).
- **`friendlies.json`** `{ updated, source, fixtures:[{ id, date, kickoff, home, away, homeName, awayName, prediction, botPick, result? }] }`.
- **`posted.json`** `{ log:{ [id]:{ b1,b2,b3 } }, used:{...}, sched:{...} }` — X poster idempotency + rotation state.
- **`x-feed.json`** newest-first array of posted tweets rendered on-site.
- **`x-content.json`** the tweet copy decks (beats 1/2/3, handles).
- **`news-signals.json`** rolling cache of detected NEWS signals: `{ updated, injury:{slug:{tier,firstSeen,lastSeen}}, crisis:{slug:{firstSeen,lastSeen}} }`. Written by the pipeline (and best-effort by the preview). See §5.1.

---

## 3. Layer 1 — Base skill (`ratings.mjs`)

`buildRatings(playedResults)` → `{ ratings: {slug:Elo}, gapFilled:[] }`.

1. Seed from `elo-calibrated.json` (≈39 teams).
2. **Gap-fill** the other ~9 finalists by least-squares regression of Elo on FIFA
   rank across the teams we *do* have, then predict from rank.
3. **Nudge forward** with 2026 results chronologically (standard Elo update):
   `K_WC=55`, goal-difference multiplier (`1 / 1.5 / (11+gd)/8`), host bonus
   `HOME_ADV=75` for `HOSTS = {mexico, usa, canada}`.

This is **skill** — permanent and earned. It is the *only* thing the result-driven
Elo update touches. Friendlies are **not** fed here.

---

## 4. Layer 0.5 — Calibration & the pick (`elo.mjs`)

- `expectedScore(a,b,hb)` — logistic Elo win expectancy (÷400).
- `expectedGoals(rating, opp, hb)` = `GOALS_BASE + (rating+hb − opp)/GOALS_SPREAD`,
  clamped `[0.3, 3.5]`.
  - **`GOALS_BASE = 1.25`**, **`GOALS_SPREAD = 450`** (re-tuned 2026-06).
  - **Why these numbers:** the original `1.35 / 350` was over-confident — it
    predicted draws at ~22% while ~40% of early games drew, and rounding the mean
    erased draws entirely (0/8 draws called). Lowering the base and flattening the
    slope lifts draw mass. See §11 for the backtest that picked 1.25/450.
- `matchProb(a,b,hb)` — Dixon-Coles bivariate Poisson over 0–8 goals each side,
  `DC_RHO=-0.13` corrects the 0-0/1-1 under-count. Returns `{winA,draw,winB,expectedGoalsA,expectedGoalsB}`.
- **`modalScore(a,b,hb)` / `pickScore(a,b,hb)`** — THE committed pick = the **argmax
  exact-scoreline cell** of that grid (the "ten-million simulation" made literal).
  - This **commits to a draw** (1–1/0–0) when that's genuinely the modal cell, and
    crucially lets news/morale rating shifts actually *move* the score — the old
    `Math.round(mean)` swallowed any shift under 0.5 goals (so the whole news layer
    was invisible at the scoreline). `pickScore` is just a stable alias kept for
    callers (`update.mjs`, `friendlies.mjs`).
- `sampleMatch`, `poissonSample` — Monte-Carlo helpers (used by experiments, not the
  live pick).

**Caution:** `expectedGoals`/`matchProb` also drive the public site percentages **and**
friendly predictions. Changing `GOALS_BASE`/`SPREAD` changes those too — it's a
visible, global recalibration, not just the bot's picks.

---

## 5. Layer 2 — News & context (`context.mjs`)

Anticipates upsets from who's *available* and the mood around the camp.

- **Inputs / env:** `API_FOOTBALL_KEY` (cards→suspensions, per-fixture injuries),
  `NEWSDATA_KEY` (news injuries + crisis). `WC_LEAGUE_ID` (default `1`), `WC_SEASON`
  (default `2026`).
- **Signals → Elo penalty (subtracted from rating):**
  - Suspensions from card accumulation: `SUSPENSION_WEIGHT=18` × player tier.
  - Structured per-fixture injuries: `STRUCT_INJURY_WEIGHT=16` × tier.
  - News injuries (hedged, noisy): `NEWS_INJURY_WEIGHT=8` × tier.
  - Crisis (coach sacked, mutiny, etc.): `CRISIS_PENALTY=12`.
  - **Player importance tier:** featured star ×3, notable squad ×2, anonymous ×1.
  - Per-team cap `MAX_TEAM_PENALTY=120`.
- **Gating — READ THIS:**
  - Returns a **no-op** if neither API key is set.
  - Adjustments are only **applied** when `CONTEXT_ENABLED=1` (repo var; default `1`
    in workflows). Otherwise it's diagnostic-only (logs signals, changes nothing).
  - `update.mjs` only *calls* the news APIs when a fixture is within
    `FREEZE_HORIZON_HOURS + 1` of kickoff (cost control). The daily preview forces it on.
- **Output:** `{ enabled, applied, adjustments:{slug:penalty}, reasons:{slug:[strings]}, coverage, signalCache }`.

### 5.1 The rolling news-signal cache (why preview and lock used to disagree)

NewsData is **volatile**: each query returns only the latest ~10 articles and that
set churns constantly. So a real injury story could be flagged by the 16:24 preview
and gone from the 18:41 freeze query — which is exactly the "preview said injury,
lock said no news" bug. (Confirmed in run logs: 15:24 UTC flagged `argentina, england,
jordan`; 17:41 UTC flagged `none`.)

Fix: detected NEWS signals are cached in `news-signals.json` and kept **live for
`NEWS_SIGNAL_TTL_HOURS` (default 36h)**. Each run folds its fresh detections into the
cache, prunes anything past the TTL, and the **effective** signals applied to a pick
are `fresh ∪ remembered`. So a signal seen once shapes every pick that freezes within
the TTL, and the preview + the lock stay consistent. Cached-but-not-fresh signals are
labelled `(recent)` in the reason text. Only NEWS is cached — suspensions/structured
injuries come from API-Football and are already stable.

- **Who writes it:** the pipeline (`update.mjs`, committed with the rest of
  `src/data/`) **and** the preview (`preview-picks.mjs`), which commits *only* this one
  file, **best-effort** (rebase + retry, never fails its job). The preview is the more
  frequent news sampler, so letting it feed the cache matters when the pipeline cron is
  sparse.
- **Matching is football-gated:** a team is only flagged when the article also matches
  a football-context regex (`football|world cup|fifa|striker|coach|…`), which kills
  cross-sport false positives (e.g. an "England" cricket injury). Team names are
  regex-escaped before matching.

---

## 6. Layer 3 — Momentum & morale (`momentum.mjs`)  ← the newest layer

The **psychological** overlay: what frame of mind a team *arrives in* for its next
match. Separate from skill so a result is never double-counted (skill = earned &
lasting; morale = felt & fleeting).

### Inputs
`computeMomentum(ratings, { wcResults, friendlies, asOf? })`:
- `wcResults` = `results.json` (WC games, weighted heavily).
- `friendlies` = `friendlies.json` fixtures (run-up form; **the one deliberate
  exception to friendly isolation — morale only, never skill Elo**).
- `asOf` = ISO date; only matches **strictly before** it are used (walk-forward backtests). Omit = all.

### Formula (per team, over its last `LAST_N=10` matches, newest first)
For each past match:
- `result` = win 1 / draw 0.5 / loss 0.
- `expected` = `expectedScore(teamElo, oppElo)` (no home adv in the morale read).
- `contrib = SURPRISE_GAIN × (result − expected)` with `SURPRISE_GAIN=55`.
  - Over-performing vs a *stronger* team yields a bigger boost automatically (this is
    the "held Spain → confident; Spain → rattled" effect).
- **Humiliation override:** if it's a loss **and** (margin ≥ `HUMILIATION_GD=3` **or**
  conceded ≥ `HUMILIATION_GA=4`), subtract an extra `HUMILIATION_HIT=25` — a heavy
  hit "like losing a star", per design.
- **Weight** of this match in the average = `DECAY^age × competitionWeight`, with
  `DECAY=0.72`, `WC_WEIGHT=2.5`, `FRIENDLY_WEIGHT=1.0`.

Morale = **weighted *average*** of contributions (`Σ contrib·w / Σ w`), clamped to
`±MORALE_CAP=50`.

> **Why a weighted average, not a sum:** "WC counts 2.5×" must mean a WC match
> *dominates the read*, not that morale is 2.5× larger. An earlier weighted-*sum*
> version pinned half the teams at ±50; the average keeps morale in natural
> "Elo-of-surprise" units so normal results are gentle (±15–30) and only
> humiliations/giant-killings approach the cap. Do not revert to a sum.

### Output
`{ morale:{slug:signedElo}, reasons:{slug:[string]} }`. Positive = arrives confident
(rating up); negative = under pressure (rating down). Reasons are human-readable and
flow into the freeze/lock notification, e.g. *"morale — arrives confident (+25);
recently drew 0–0 with Spain (above expectations, WC)"*.

### Sanity reference (as of 2026-06 data)
Cape Verde **+25** (held Spain), Spain **−25**; Côte d'Ivoire **+29**; humiliations
Paraguay **−39** / Tunisia **−38** / Iraq **−35**. Nothing pinned at the cap.

---

## 7. The pipeline (`update.mjs main()`)

Order of operations — **do not reorder casually**:

1. **Results:** fetch openfootball (4 retries, backoff). On failure keep last good
   `results.json`. **Never hard-fail.**
2. **Ratings:** `buildRatings(playedForModel)`.
3. **News (conditional):** if a fixture is within `FREEZE_HORIZON_HOURS+1`, call
   `fetchContext()`; if `applied`, **subtract** penalties from ratings.
4. **Morale (always):** `computeMomentum(ratings, {results, friendlies})`; **add**
   signed deltas to ratings; merge morale reasons into the context-reasons channel.
5. **Predictions:** `predictionsFor(ratings)` → `predictions.json` (source `model`;
   on model exception, `fallbackPredictions()` labels them `estimated`).
6. **Freeze:** `freezeBotPicks(ratings, results, context)` — see below.
7. **Notify:** POST one `pick_locked` event per newly frozen pick to
   `MAKE_FREEZE_WEBHOOK` (Telegram). No-op if unset.
8. **Friendlies:** `buildFriendlies()` (skips without `API_FOOTBALL_KEY`).
9. **Build/commit:** `npm run build`; with `--commit`, commit & push (Netlify deploys
   the committed `dist/`).

### Freezing rules (`freezeBotPicks`) — INVARIANTS
- **Immutability:** once `botPicks[id]` exists it is **never** regenerated. This is
  what lets THE AI honestly claim "I never change my mind." Do not "recompute" picks.
- A pick is frozen only when a fixture is within `FREEZE_HORIZON_HOURS=5` of kickoff
  (so the freshest news/morale is baked in; pipeline runs every 3h ⇒ each match
  freezes ~2–3h before *its own* kickoff).
- **QA guard:** any fixture within `FREEZE_QA_HOURS=4` with no pick sets a non-zero
  exit code (something broke).
- `kickoffMs(m)` treats stored `date`+`time` as **UTC**. ⚠️ See §10.

---

## 8. Preview & Telegram digest (`preview-picks.mjs`)

Read-only. Rebuilds ratings, **forces news on** (so games hours out get a fresh read),
applies morale, prints each upcoming pick with W/D/L, xG and reasons, and POSTs a
daily digest to `MAKE_FREEZE_WEBHOOK`. **Never freezes picks, writes prediction data,
or posts to X** — the sole exception is that it commits `news-signals.json` (the shared
signal cache, best-effort; see §5.1) so its frequent samples are remembered for the
lock. It mirrors the live layer order (news → morale) so the preview matches what will
freeze. Env: `PREVIEW_WINDOW_HOURS` (default 20).

---

## 9. Posting (`post-picks.mjs`) — three beats

- **Beat 1 (dare):** up to `BEAT1_LEAD_MS=6h` before kickoff. Copy from
  `x-content.json` deck (group fixtures) or generated from the bank.
- **Beat 2 (locked pick):** within `BEAT2_WINDOW_MS=15min` of kickoff — the **frozen**
  `botPicks` scoreline, link-free. Must go out before kickoff or Beats 2 & 3 are skipped.
- **Beat 3 (result):** at full time, only if Beat 2 actually posted (honesty rule).
- Idempotent via `posted.json`; dry-runs (logs only) without X creds; mirrors posts to `x-feed.json`.

---

## 10. ⚠️ The kickoff-UTC / date-crossing gotcha (history)

`matches.js` stores naive `date`+`time` treated as UTC. Night games that cross into
the next UTC day were once stored a day early, so the poster fired ~24h+ early
(the "M020 Austria v Jordan" incident — tweets had to be retracted via
`scripts/delete-tweets.mjs`). **When editing fixtures, verify kickoff against the
openfootball feed** (the pipeline logs unmapped/mismatched names). All times are UTC.

---

## 11. Tuning & validating the model (DO THIS BEFORE SHIPPING CHANGES)

Three committed harnesses, all **walk-forward** (each game predicted from only prior
results — no leakage) and **write nothing**:

- **`backtest-momentum.mjs`** — the headline OLD-vs-NEW-vs-frozen comparison. Run it
  after *any* change to `elo.mjs`, `ratings.mjs`, or `momentum.mjs`.
- **`calibrate-sweep.mjs`** — sweeps `GOALS_BASE`/`GOALS_SPREAD`/`DC_RHO` (`BASE=`,
  `RHO=` env overrides), reporting predicted-vs-observed draw rate and **Brier**
  (a proper score, more stable than hit-count at small n).
- **`backtest-picks.mjs`** — mechanic comparison (chalk / draw-honor / sim-mode / chaos).

**Current result (n=20 played, 2026-06):**

| engine | exact | outcome% | points | draws hit (of 8) |
|---|---|---|---|---|
| OLD (1.35/350, round+break) | 2 | 50% | 14 | 0 |
| **NEW (1.25/450 modal + morale)** | **5** | **60%** | **22** | **6** |

The gain is almost entirely **finally predicting draws**. Morale contributed
positively at the chosen config (22 vs 19 pts without it).

> **Overfitting caveat:** n=20 is tiny and the 40% draw rate is inflated by cagey
> openers (history ≈ 28–30%). 1.25/450 is a *balanced* middle, not a corner. Re-run
> `calibrate-sweep.mjs` as games accumulate and track **Brier over time** rather than
> re-tuning to chase the current sample.

### Tuning the morale layer
Knobs live at the top of `momentum.mjs`: `LAST_N`, `DECAY`, `WC_WEIGHT`,
`FRIENDLY_WEIGHT`, `SURPRISE_GAIN`, `HUMILIATION_GD/GA/HIT`, `MORALE_CAP`. After any
change, eyeball the distribution (the snippet in §6) and re-run `backtest-momentum.mjs`.

---

## 12. Environment variables & secrets

| Name | Where | Used by | Effect |
|---|---|---|---|
| `X_API_KEY/SECRET`, `X_ACCESS_TOKEN/SECRET` | secret | post-picks, delete-tweets | X OAuth1.0a. Absent ⇒ dry-run. |
| `API_FOOTBALL_KEY` | secret | context, friendlies | Cards/injuries/friendlies. Absent ⇒ those no-op. |
| `NEWSDATA_KEY` | secret | context | News injuries/crisis. |
| `CONTEXT_ENABLED` | var (default 1) | context | `1` = news adjustments **applied**; else diagnostic-only. |
| `MAKE_FREEZE_WEBHOOK` | secret | update, preview | Telegram lock + daily digest. Absent ⇒ skipped. |
| `WC_LEAGUE_ID` / `WC_SEASON` | optional | context | API-Football league/season (default `1`/`2026`). |
| `NEWS_SIGNAL_TTL_HOURS` | optional | context | How long a detected news signal stays "live" in `news-signals.json` (default 36). |
| `FREEZE_HORIZON_HOURS` | optional | update | Freeze window (default 5). |
| `PREVIEW_WINDOW_HOURS` | optional | preview | Look-ahead window (default 20). |

---

## 13. Workflows (`.github/workflows/`)

| File | Trigger | Does |
|---|---|---|
| `data-pipeline.yml` | cron `0 */3 * * *` + manual | `npm run update:commit` — full pipeline + deploy. Has all keys + `CONTEXT_ENABLED`. |
| `preview-picks.yml` | cron `0 11 * * *` (12:00 BST) + manual | Preview + Telegram digest. `contents: write` — commits ONLY `news-signals.json` (best-effort). |
| `x-poster.yml` | cron `7,15,…,55 16-23,0-7 * * *` + manual | `post-picks.mjs` three-beat poster (default-branch only). |
| `x-delete.yml` | manual only | Retract tweets by id. |

---

## 14. Invariants — break these and the system lies or double-posts

1. **Frozen picks are immutable.** Never regenerate `botPicks.json` entries.
2. **Friendlies never touch skill Elo.** They feed *morale only* (the documented
   exception). Keep `ratings.mjs` free of friendly results.
3. **Skill vs morale are separate** — never fold morale back into the persisted Elo
   (that double-counts and compounds).
4. **The pipeline must never hard-fail.** Feed down ⇒ last-good results; model throws
   ⇒ labelled `estimated` fallback.
5. **Honesty rules:** Beat 2 must precede kickoff; Beat 3 only if Beat 2 posted;
   `estimated` predictions are never passed off as `model`.
6. **All fixture times are UTC.** Validate against openfootball (§10).

---

## 15. Known limitations & future work

- **Chaos dial (designed, not yet built):** news/morale currently shift the *mean*
  strength. A planned extension makes a large combined |adjustment| also widen the
  scoreline distribution (raise a per-match "temperature"), so genuinely uncertain
  games (depleted favourite vs surging underdog) produce bolder upset calls. The
  Monte-Carlo plumbing (`sampleMatch`) already exists for this.
- **Morale history depth:** v1 uses WC results + the rolling `friendlies.json` window.
  A persistent per-team match history (e.g. last 10 internationals via API-Football)
  would deepen the "last 10 matches" read beyond what friendlies.json retains.
- **News at the probability level:** today news is an Elo penalty; expressing some
  signals directly as probability/variance shifts could be more faithful.
- **Sample size:** all tuning is on a handful of games. Prefer Brier-over-time to
  per-week re-tuning.
```
