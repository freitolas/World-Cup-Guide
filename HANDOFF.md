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

## DONE later 2026-06-07
- **Warm-ups surface** + **Wes Anderson redesign** shipped (game/).
- **Milestone 2 backend + front-end (accounts + paywall):**
  - Supabase project **Humans Are Inferior** = `ahznwacqwfqariiqmorb` (eu-west-1).
    URL `https://ahznwacqwfqariiqmorb.supabase.co`; publishable key in `game/src/supabaseClient.js` (public, safe).
  - Tables (RLS clean): `profiles` (name + opt-in consent), `entitlements` (paid, expires 2026-07-19), `picks` (sync).
  - Edge function **stripe-webhook** deployed: `https://ahznwacqwfqariiqmorb.supabase.co/functions/v1/stripe-webhook` (signature-verified, writes entitlement via service role).
  - Front-end: `#/account` (magic-link sign-in + opt-in consent), `#/knockouts` (entitlement-gated $5 paywall via Stripe Payment Link + client_reference_id).

## ⭐ Stripe payment is unfinished — see **`STRIPE_BACKLOG.md`** (self-contained, for a fresh session). Stripe MCP wasn't reachable last session; verify it first.

## BLOCKING OWNER STEPS to make payment/login work (no Stripe MCP — owner must do in dashboards):
1. **Stripe:** create a **$5 one-time Payment Link**. Add a **webhook** → the stripe-webhook URL above, event `checkout.session.completed`. Copy the **signing secret**.
2. **Supabase secrets** (Edge Functions → Secrets): set `STRIPE_WEBHOOK_SECRET` (and optionally `STRIPE_SECRET_KEY`).
3. Give me the **Payment Link URL** → set `VITE_STRIPE_PAYMENT_LINK` (build env). Public, safe.
4. **Publish the game** to its own Netlify site (base dir `game`) → get the live URL.
5. **Supabase Auth → URL Configuration:** add the live site URL as Site URL + Redirect URL (magic links need this).

## TODO / not done
- **Publish** the Game (own Netlify site/domain) — not yet deployed anywhere public.
- **Verify auth live** (magic-link redirect + hash router may need a small tweak; untested without a live URL + email).
- **Pick sync** to the `picks` table (free-account benefit) — table exists, front-end wiring TODO.
- **Matchday 1–2:** context-layer activation checkpoint (above); set `CONTEXT_ENABLED=1` once validated.
- X auto-posting, global "Humanity vs THE AI" scoreboard, leaderboard (rest of M2).
- Guide Phase 2 paywall (separate product).

## NEXT: X (Twitter) auto-posting — THE AI posts its picks before kickoff
The honesty mechanic ("public, timestamped, before kickoff, no edits") only holds
if THE AI actually posts. The lock/post rule is now **5 minutes before kickoff**
(`LOCK_LEAD_MS` in `game/src/data.js`; copy in `voice.js` + landing). To make the
posting real:

1. **X API access:** create an X developer app with **write** scope. Get
   `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_SECRET` (OAuth 1.0a
   user context — needed to post). Store as CI/host secrets, never in the repo.
2. **Poster:** add `scripts/lib/postToX.mjs` — given a fixture + its frozen
   `botPick`, format the post (e.g. `Locked: ENG 2–1 BRA. Before kickoff, as
   always.`) and call `POST /2/tweets`. Make it **idempotent**: record posted
   match ids (e.g. a committed `src/data/posted.json`) so a match is never
   tweeted twice.
3. **Scheduler (the real work):** the daily Action is too coarse. Add a GitHub
   Actions `schedule` cron running every ~5 min that finds fixtures kicking off in
   the next 5–6 min that haven't been posted, freezes/reads their `botPick`,
   posts, and marks them posted. (Alternatively a Supabase scheduled Edge
   Function.)
4. **Feed:** `game/src/components/XFeed.jsx` already embeds the real
   @inferiorhumans timeline (click-to-load). Once posting is live it fills in.
   With API access we could later swap the embed for our own styled render of
   fetched posts for a fully on-brand feed.

## Marketing attribution — leads & conversions (first-party)
First-touch source is captured on landing (`game/src/attribution.js`, called from
`main.jsx`) from `utm_*` params + referrer, and written to `profiles.attribution`
(jsonb) at signup (`auth.js`). The X auto-posts tag links with
`utm_source=x&utm_medium=social&utm_campaign=ai_picks&utm_content=<matchId>`.
No cookies, no third-party scripts.

**Leads (signups) & conversions (paid) by source** — run in the Supabase SQL editor:
```sql
select
  coalesce(p.attribution->>'utm_source', '(direct)')   as source,
  coalesce(p.attribution->>'utm_campaign', '(none)')   as campaign,
  count(*)                                              as leads,
  count(e.user_id)                                      as conversions,
  round(100.0 * count(e.user_id) / nullif(count(*),0), 1) as conv_pct
from public.profiles p
left join public.entitlements e on e.user_id = p.id
group by 1, 2
order by leads desc;
```
For the link A/B specifically: the link-on weeks carry `utm_source=x`; the
link-off week (from 2026-07-06, `LINKS_OFF_FROM` in `scripts/post-picks.mjs`)
will mostly show up as `(direct)` — compare lead/conversion volume across the
two periods (filter by `p.created_at`). Top-of-funnel click volume (visitors who
don't sign up) is NOT captured by design — add a cookieless pageview tool
(Plausible/Umami) later if you want that layer.

## Identity / brand locks (for the Game)
THE AI · handle **@inferiorhumans** · **humansareinferior.com**. Voice = `game/src/voice.js` + the uploaded VOICE_GUIDE. Not gambling; unofficial; not affiliated with FIFA.
