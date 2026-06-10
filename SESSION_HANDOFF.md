# Session handoff — THE AI / humansareinferior.com (last updated 2026-06-10)

## ▶ NEXT SESSION (pick up here) — Telegram paid-predictions bot
Full spec on branch `claude/whatsapp-bot` → **`TELEGRAM_BOT.md`** (read it first). Pay $5 → THE AI's locked pick by Telegram at the 15-min freeze. Make-orchestrated.
- **DONE:** Stripe live (product `prod_UgEfZxz9EcwZCs`, price `price_1TgsyaLKlGUdOcGM8GHlV2CD`, link `https://buy.stripe.com/dRmbJ25Z84p714C8EodAk05`); landing `game/public/predictions.html`; repo firer `scripts/notify-make.mjs` + `.github/workflows/notify-make.yml` (idempotent via `src/data/make-sent.json`, dry-runs without `MAKE_WEBHOOK_URL`).
- **BLOCKED ON OWNER (bring these tomorrow):** (1) **Telegram bot token + username** from @BotFather; (2) **Make team ID** (from your Make URL `.../team/NNNN`) — the Make MCP can't list teams, so I need it to create the incoming webhook + subscribers data store via API. With those two I can build the webhook/data store and guide the 3 Make scenarios (Stripe→subscriber, /start→chat_id, webhook→fan-out).
- **THEN:** add repo secret `MAKE_WEBHOOK_URL`; set Stripe link's post-payment redirect to `t.me/<bot>?start={CHECKOUT_SESSION_ID}`; merge to deploy branch (landing goes live + `notify-make` schedule activates). Disable workflow after 2026-07-19.
- ⚠️ **MERGE FOOTGUN:** `claude/whatsapp-bot` still has the **OLD** workflow filenames (`post-picks.yml`, `daily-update.yml`). The default branch was just renamed to `x-poster.yml` / `data-pipeline.yml` (stale-schedule fix, below). **Before merging, rebase whatsapp-bot onto upbeat / re-apply the rename** so the merge doesn't resurrect the old filenames and re-break the schedule. Only `notify-make.yml`, `notify-make.mjs`, `predictions.html`, `TELEGRAM_BOT.md` should land.

## Branches & deploy (read first)
- **Work branch:** `claude/admiring-curie-UYl3h`. **Default + deploy branch:** `claude/upbeat-cerf-CJnYx` ("upbeat").
- Push to BOTH: `git push origin claude/admiring-curie-UYl3h` then `git push origin claude/admiring-curie-UYl3h:claude/upbeat-cerf-CJnYx`.
- ⚠️ The `daily-update` and `post-picks` workflows **commit to `upbeat`** (posted.json, data refresh). So before pushing, `git fetch origin claude/upbeat-cerf-CJnYx && git merge --no-edit origin/claude/upbeat-cerf-CJnYx` to avoid rejection.
- GitHub MCP scope: `freitolas/world-cup-guide` only. Trigger workflows via `mcp__github__actions_run_trigger`; read logs via `mcp__github__get_job_logs`.

## Two products in one repo
- **Root** = World Cup **Guide** → worldcupguide.netlify.app (Netlify, deploys from `upbeat`).
- **`game/`** = THE AI prediction game → **humansareinferior.com** (separate Netlify site `humansareinferior`, base dir `game`, deploys from `upbeat`). React 19 + Vite, cold-dark theme.
- Game routes (hash router, `game/src/App.jsx`): `/` Landing, `/play` Game, `/warmups`, `/account`, `/knockouts`, `/leaderboard`, `/team/:id`. Global TopBar = brand + single auth affordance (Sign in/up → Account/Log off).

## Domain / auth
- Namecheap DNS (BasicDNS): `@` A → 75.2.60.5, `www` CNAME → humansareinferior.netlify.app. Apex HTTPS works.
- Namecheap API only works from a whitelisted IP (35.202.211.96 was added; container IP rotates — re-whitelist if managing DNS again). **Regenerate the Namecheap API key** (it printed in chat once).
- Supabase project `ahznwacqwfqariiqmorb`. Magic-link redirect: app requests `SITE_URL` (`https://humansareinferior.com`, `game/src/supabaseClient.js`). **Netlify 301 redirect** (`game/netlify.toml`) sends humansareinferior.netlify.app → custom domain so links land right. **Owner TODO (cleaner fix):** set Supabase Auth → URL config → Site URL = `https://humansareinferior.com` + add to Redirect URLs.

## Supabase schema
- `profiles` (id, display_name, marketing_opt_in, consent_at, **attribution jsonb**), `entitlements` (user_id, tier, expires_at), `picks` (M1 not yet synced). RLS on.
- First-party attribution: `game/src/attribution.js` captures first-touch utm_*/referrer → written to `profiles.attribution` at signup. Funnel query in `HANDOFF.md`.

## X auto-poster (LIVE — credits funded, account marked automated)
- `scripts/post-picks.mjs` (3-beat engine) + `scripts/lib/postToX.mjs` (OAuth 1.0a, node:crypto). Secrets: `X_API_KEY/X_API_SECRET/X_ACCESS_TOKEN/X_ACCESS_SECRET`.
- Content `src/data/x-content.json`: `beat1Deck` (72 verbatim group tweets, links+tags authored in), `beat1Bank` (20 templates for warm-ups/knockouts), `beat2` (4), `beat3` {exact50, right100, wrong50}, `handles` (48 team→@handle). Source: `BEAT1_CORRECTED_DECK.md` + the owner's deck. **Verified zero disparity** vs owner's latest deck.
- Posting log `src/data/posted.json` (per-beat + pool rotation + scheduled). Workflow **`.github/workflows/x-poster.yml`** (RENAMED from `post-picks.yml`): dense cron `7,15,23,31,39,47,55 16-23,0-7 * * *` (every ~8 min in match hours so Beat 2 reliably hits the 15-min window), active-window gate (2026-05-19..07-20). `--test` via workflow_dispatch input `test=true`. **Manual trigger now uses workflow_id `x-poster.yml`.**
- **STALE-SCHEDULE FIX (2026-06-10):** GitHub kept running the OLD post-picks/daily-update crons despite new schedules on default (stale-schedule cache; disable/enable didn't stick). Renamed `post-picks.yml`→`x-poster.yml` and `daily-update.yml`→`data-pipeline.yml` so GitHub registers them as NEW workflows from scratch. **Verified:** repo now lists exactly 2 workflows with fresh IDs/paths (old ones gone); a manual dispatch of `x-poster.yml` ran green in 9s (plumbing + secrets intact). **NOT yet verified:** the cron self-firing — first ~40 min after registration showed GitHub's normal first-run warm-up lag (ticks skipped). Expect it mature by the June 11 opener (Mexico v South Africa, 20:00 UTC; Beat-2 ticks 19:47+19:55). **Insurance:** if unsure near the opener, manually trigger `x-poster.yml` ~19:45 UTC (idempotent — posted.json guard prevents double-post).
- Beats: **B1** dare (verbatim deck for group, ≤6h pre-KO, odd=link/even=link-free); **B2** frozen locked pick (link-free, ≤15min pre-KO, MUST be before KO); **B3** result (pool by exact/right/wrong, no-repeat; skipped if B2 didn't post). Tag only the 2 teams.
- **Scheduled marketing posts hook (ready, empty):** `src/data/scheduled-posts.json` = `[{id, at(ISO), text}]`, posted once at `at`, link-free. Owner will send an MD to populate.

## Prediction engine
- `vendor/wc-model/elo.mjs`: Elo + Dixon-Coles. **`pickScore()`** = round expected goals, then break a draw toward a clear favourite (drawThresh 0.05). Replaced the modal scoreline → group pick-draws 43%→~4%, best accuracy in test, and rating shifts now FLIP the pick (upsets show).
- `scripts/update.mjs` daily pipeline: results (openfootball, free) → predictions (matchProb) → context → freeze botPicks (immutable) → friendlies → build/commit.
- **Upset/context layer** (`scripts/lib/context.mjs`), `CONTEXT_ENABLED` defaults **1** (ON): star-weighted penalties — featured star ×3, notable(desc) ×2, squad ×1 (featured list `src/data/featured.js`); MAX_TEAM_PENALTY 120. Suspensions (cards, matchday 2+, ×weight), structured injuries (API-Football, often 0 for NTs), injury news (NewsData, hedged, star-name boost ×3), crisis. ~2.5 W/D/L pts per 18 Elo; one star out (−54) flips a near-even elite game (verified France v Spain 1-2 → 2-1).
- **Freeze timing:** `FREEZE_HORIZON_HOURS=5`, pipeline runs **every 3h** → each match freezes ~2-3h before ITS kickoff (was 24h horizon = late matches stale). Context APIs only called when a fixture is within the freeze window (quota protection). Picks immutable once frozen.
- **Public lock = 15 min** everywhere: in-app `LOCK_LEAD_MS` (game/src/data.js), Beat-2 window (post-picks.mjs), copy (voice.js, Landing, x-content.json beat2). Ensures THE AI's pick is never public on X while users can still edit (closed a copy-the-AI hole). NB: source `Tweets_Copy_Deck.md` Beat-2 still says "five minutes" — live content updated to fifteen.

## Leaderboard
- `/leaderboard` route + home teaser, read `src/data/leaderboard.json` (`{leaders:[{name,you,ai}]}`, empty → "NO HUMANS ARE BEATING ME" taunt; populated → #1 + rude line). Needs M2 pick-sync backend to fill.

## Owner TODO / open
- Supabase Site URL → custom domain (cleaner than the Netlify redirect).
- Stripe payment unfinished — `STRIPE_BACKLOG.md`.
- API-Football suspension scan re-reads all finished matches each run; add caching if the daily cap is hit deep in the knockouts.
- Update `Tweets_Copy_Deck.md` Beat-2 "five"→"fifteen" if editing from that file.

---

## FUTURE TASK 1 — Translate everything to Brazilian Portuguese (pt-BR)
- **Where the copy lives:** `game/src/voice.js` (THE AI voice strings — HERO, TRUST, SCOREBOARD, MATCH, NUDGE, OMNISCIENCE, ERRORS, LEADERBOARD), inline JSX in every `game/src/components/*` (Landing, Account, Warmups, Knockouts, Leaderboard, MatchCard, FriendlyCard, Game, Scoreboard, Nudges, TeamDetail), `game/index.html` meta/OG, legal pages `game/public/*.html`.
- **Approach:** introduce a locale layer (e.g., `game/src/i18n.js` with `en` + `pt-BR` dictionaries, or a `voice.pt.js`) and a `lang` toggle/auto-detect; replace hardcoded strings with keys. Keep it dependency-light (no i18n library needed for one extra language).
- **CRITICAL:** THE AI's voice is a stylized brand asset (cold, deadpan, superior — Dbrand-esque). pt-BR must **re-create the tone**, not literal-translate. Treat it like the original copywriting pass.
- **X copy deck:** separate decision — keep tweets English, or author pt-BR Beat-1/2/3 variants for a Brazilian audience. The team→handle map stays.

## FUTURE TASK 2 — Owner-only admin panel (latest predictions)
- **Goal:** a private view of the latest predictions + THE AI's frozen picks + the upset/context adjustments, just for the owner.
- **Data already available (committed each pipeline run):** `src/data/predictions.json` (win/draw/loss + eg per fixture), `src/data/botPicks.json` (frozen picks), `src/data/results.json`, `src/data/friendlies.json`.
- **Recommended enhancement:** persist the context layer's diagnostics each run (currently only logged) to a committed file e.g. `src/data/context-latest.json` (which teams were docked, by how much, why — suspensions/injuries/crisis), so the admin panel can show WHY a pick is an upset. Small change in `update.mjs` (write `ctx` summary) — do this when building the panel.
- **Access (owner-only):** simplest = `/admin` hash route in the game that requires the logged-in Supabase user to match an allowlist (owner email `rafael4sites@gmail.com` or an `is_admin` flag / `app_metadata`). Render the JSON above as tables (predictions, picks, context reasons, warm-up record). Keep it read-only. Don't expose via public nav.

## PARKED IDEA — "AI vs AI" rival-LLM takedowns (content pillar)
Concept: after a match THE AI won the prediction on, find tweets where a rival LLM
(OpenAI/ChatGPT, Gemini, Claude, Perplexity) predicted it WRONG, surface a
candidate list for owner approval, then post timely replies ("Gemini said 2-1. I
said 1-2. Final: 1-2."). Owner parked it 2026-06-09 to think it over. Considerations
captured for when it's revisited:
- **Needs X API READ / recent-search** — unverified whether this account's tier
  allows it; under the credit model it's ~$0.005 per post returned. Test cheaply
  before committing.
- **Extraction is noisy** — parsing a rival's predicted score from free-text tweets
  is fuzzy (paraphrase, sarcasm, screenshots) → false positives. This is exactly
  why the human-confirm gate is right (and it matches the build brief §7 guardrail:
  no automated replies; takedowns stay human-in-the-loop).
- **Surfacing the list:** an autonomous GitHub job can't message a chat — options
  were (a) write `src/data/reply-candidates.json` + open a GitHub issue, or (b)
  owner pings a session and Claude runs it live. Undecided.
- **Safer complement:** a proactive "AI vs AI scoreboard" — owner seeds each LLM's
  pre-match prediction for marquee games, THE AI posts the comparison after FT.
  Fully controllable, no X-search dependency. Could pair with or replace the
  reactive version.
- Reply/quote-tweet carries more spam/conflict risk than standalone posts; keep
  volume low and human-approved.
