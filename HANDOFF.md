# Session Handoff — resume here next time

> Working branch: **`claude/upbeat-cerf-CJnYx`** (everything below is committed + pushed there).
> Deploy/default branch (Guide): `claude/rep9-netlify-repo-setup-OkyiX`.
> Read `PROJECT.md` for the full Guide architecture. This file = live status + next steps.

---

## Three products now share one repo + one prediction engine

1. **The Guide** (live, parked) — don't develop it. App lives in root `src/App.jsx` (compiled-JSX). Netlify serves committed `dist/`.
2. **The Game — "Humans Are Inferior"** (new, `game/`) — standalone, bot-first. Shares data READ-ONLY; Guide untouched.
3. **The shared pipeline** (`scripts/`) — Elo + Dixon-Coles engine + daily data + (new) bot-pick freezing.

---

## DONE so far

### Guide — Phase 1 (committed)
Unofficial rebrand off FIFA, installable PWA, cookie consent, draft legal pages (static HTML, `[PLACEHOLDERS]` unfilled). **PR NOT opened** — user chose to hold and stack. Phase 2 (Stripe+Supabase paywall: group free / knockout locked) is planned, not built.

### Game — Milestone 1 (committed, `game/`)
- Isolated clean React/Vite app, own `package.json` + `netlify.toml` (deploy as a SEPARATE Netlify site, base dir `game`). Guide is a different site.
- Fixtures-first, THE AI voice everywhere (`game/src/voice.js`), pinned You-vs-THE AI scoreboard, commit-and-reveal lock (pick before kickoff → hidden bot pick → reveal at kickoff), deterministic scoring (exact 5 / GD 3 / result 1) identical for human + bot, **forfeit rule** (no pick = 0, AI still scores), localStorage only (£0, anonymous), both required nudges, teams/players via fixtures (no top-level tabs), full landing page. Build verified.
- **NOT started: Milestone 2** (accounts/Supabase, Stripe one-time $5, X auto-posting, global "Humanity vs THE AI" scoreboard, leaderboard). Needs owner keys.

### Pipeline (committed)
- `scripts/update.mjs` now freezes THE AI's **modal scoreline** per fixture → `src/data/botPicks.json`. 72/72 group fixtures currently frozen.
- Engine UNCHANGED. Today the daily run only ingests **match results (scores)** from openfootball and nudges Elo ratings. **No news / injuries / cards / suspensions anywhere** — confirmed with the user; this was a gap vs. what they expected.

---

## DECISION IN FLIGHT — the news/context layer (build next)

User wants the bot to weigh **yellow cards, suspensions, injuries, and crises** to anticipate upsets. Researched free sources; conclusions:

- **Cards/suspensions/injuries/line-ups → API-Football Pro (~$19/mo).** No reliable FREE source covers WC 2026 player-level data. `/injuries` endpoint returns players out tagged **injury OR suspension** (covers 2 of 3 items in one call); `/fixtures/events` = cards; `/fixtures/lineups`.
- **News/crisis → NewsData.io (free, commercial-OK, 200 credits/day, 12h delay)** + free RSS (BBC Sport, Guardian Football). Use for fuzzy "turmoil" only; get injuries from the structured API, not news.
- **User DECIDED: pay ~$19/mo for the real thing.** ✅

### Blocking on owner (NOT yet provided) — secrets, never commit:
1. **API-Football** key (subscribe Pro ~$19/mo at api-football.com).
2. **NewsData.io** key (free signup).
Both → **GitHub Actions secrets** (pipeline runs there).

### ⚠️ Architectural change AWAITING USER CONFIRM (raised, not yet answered):
**Freeze each fixture's bot pick on the match-day run (~24h window before kickoff) with that day's injuries/suspensions/news baked in — NOT 3 weeks early.** This requires **resetting the current `botPicks.json`** (harmless pre-tournament). Recommended; early-freeze would make the injury feature pointless. Get explicit yes before changing.

### Planned data flow (in `scripts/`, before predictions):
injuries/suspensions per fixture → availability hit; news/RSS → crisis modifier → combined rating/expected-goals adjustment for that match → predictions + frozen pick reflect it.

### Caveat to verify on first real API call:
API-Football injury coverage is rich for clubs but can be **thin for national teams** — run a test call against real WC fixtures and report completeness before relying on it.

### Hard rule:
**Never claim the bot reads news/injuries until it actually does** (false-advertising risk; undercuts THE AI's "I don't cheat" brand).

---

## IMMEDIATE NEXT STEPS (tomorrow)
1. Get user confirm on the **freeze-timing change** (and reset `botPicks.json`).
2. Get the **two API keys** into GitHub secrets.
3. Build the context layer as an **env-gated module that's a safe no-op until keys exist**, then activate + tune against real responses.
4. (Separately, when ready) Guide Phase 2 paywall + Game Milestone 2.

## Identity / brand locks (for the Game)
THE AI · handle **@inferiorhumans** · **humansareinferior.com**. Voice = `game/src/voice.js` + the uploaded VOICE_GUIDE. Not gambling; unofficial; not affiliated with FIFA.
