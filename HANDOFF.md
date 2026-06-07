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

### Keys: DONE ✅
`API_FOOTBALL_KEY` and `NEWSDATA_KEY` are set as **GitHub Actions repo secrets**.
(X API keys for M2 still pending.)

### ⚠️ Architectural change AWAITING USER CONFIRM (raised, not yet answered):
**Freeze each fixture's bot pick on the match-day run (~24h window before kickoff) with that day's injuries/suspensions/news baked in — NOT 3 weeks early.** This requires **resetting the current `botPicks.json`** (harmless pre-tournament). Recommended; early-freeze would make the injury feature pointless. Get explicit yes before changing.

### Planned data flow (in `scripts/`, before predictions):
injuries/suspensions per fixture → availability hit; news/RSS → crisis modifier → combined rating/expected-goals adjustment for that match → predictions + frozen pick reflect it.

### Coverage VERIFIED via live Action run (2026-06-07):
- ✅ League id = **1** (World Cup, season 2026). NewsData reachable (commercial-OK).
- 🚩 **API-Football `/injuries` returns NOTHING for the WC** (it tracks club injuries, not national teams). So injuries CANNOT come from there.
- **Decision (user):** ship **suspensions (from WC card events) + crisis (news)** now; treat **injuries as best-effort from news, hedged + low weight**; re-test `/injuries` during the tournament.

### Built (committed): `scripts/lib/context.mjs`
- **Suspensions:** API-Football `/fixtures?status=FT` + `/fixtures/events` → card accumulation → next-match ban heuristic (weight 18). Only produces signal from matchday 2+.
- **News (NewsData.io):** injury signal (hedged, weight 8) + crisis (weight 12), team matched by name + keyword.
- Still a no-op signal pre-tournament (0 finished matches, little crisis news). **CONTEXT_ENABLED stays 0.**

### ACTIVATION CHECKPOINT (do during matchday 1–2, ~June 12–13):
1. Re-run the Action; read `[context]` logs — confirm cards are being read and suspensions computed correctly against real results; sanity-check news matching.
2. Tune weights / the suspension heuristic (FIFA: 2nd yellow or red = 1-match ban; yellows wiped after QFs) and team-name aliases for any `UNMATCHED` names in logs.
3. Re-test API-Football `/injuries` (may populate during the tournament).
4. When trusted, set repo **variable** `CONTEXT_ENABLED=1` (Settings → Secrets and variables → Actions → Variables) to start applying adjustments.
5. Only then may the site/voice mention that the bot weighs availability/news.

### Hard rule:
**Never claim the bot reads news/injuries until it actually does** (false-advertising risk; undercuts THE AI's "I don't cheat" brand).

---

## DONE 2026-06-07 (this session)
- Keys set; context layer built + verified live (suspensions from cards, news injuries/crisis hedged). `CONTEXT_ENABLED` still 0 — activate at matchday 1–2 per the checkpoint above.
- **Freeze timing:** picks freeze only within 24h of kickoff (FREEZE_HORIZON_HOURS); botPicks reset; QA on imminent fixtures. ✅
- **Schedule:** phased cron (14:00+15:00 BST group→R16; 17:00 BST QF→final) via date phase gate. ✅
- **Per-fixture injuries probe** wired (`injuries?fixture=`); returns 0 now (no WC fixtures within 3 days) — activates at matchday 1. Re-check then.
- **Friendlies (ISOLATED):** `scripts/lib/friendlies.mjs` → `src/data/friendlies.json`. League id **10**. **28 predictable** fixtures (23 played w/ results = instant bot track record, 5 upcoming). Friendly results NEVER touch WC data. Verified live.

## IMMEDIATE NEXT STEPS
1. **Surface friendlies in the Game** (front-end, `game/`) — a "Warm-ups" view consuming `friendlies.json`: show the bot's record on the 23 played + let users play the 5 upcoming. This is what turns the data into marketable live content. (Isolated localStorage scoreboard, reuse MatchCard/scoring.)
2. **Matchday 1–2:** run the activation checkpoint (above) — validate suspensions/news/injuries-probe on real data, then set `CONTEXT_ENABLED=1`.
3. When ready: Guide Phase 2 paywall + Game Milestone 2 (accounts/Stripe/X/global scoreboard).

## Identity / brand locks (for the Game)
THE AI · handle **@inferiorhumans** · **humansareinferior.com**. Voice = `game/src/voice.js` + the uploaded VOICE_GUIDE. Not gambling; unofficial; not affiliated with FIFA.
