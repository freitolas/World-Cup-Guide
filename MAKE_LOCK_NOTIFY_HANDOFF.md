# Handoff — Make.com lock-notification (Telegram) + X-poster trigger

_Last updated: 2026-06-15 ~22:30 UTC. Resume from a laptop tomorrow._

## TL;DR
- **X-poster trigger: DONE & live.** Make scenario `6171206` polls GitHub every
  **10 min, 24/7** and fires `x-poster.yml`. Beat-2 auto-posting proven 3× today
  (M014, M016, M013). Lock tweets now land **5–15 min before kickoff** (was ~30s).
- **Lock-notification: producer DONE & live on `upbeat`; consumer (Telegram) NOT
  built yet** — blocked only on Make UI steps you'll do tomorrow.

---

## Key facts / IDs
| Thing | Value |
|---|---|
| Repo | `freitolas/World-Cup-Guide` |
| Work branch | `claude/make-x-poster-trigger-0e0cc1` |
| Deploy branch | `claude/upbeat-cerf-CJnYx` ("upbeat") |
| Make team | `837107` |
| Make trigger scenario | `6171206` ("humans are inferior") — Active, 10-min/24-7 |
| Producer commit (work branch) | `fe50d3a` |
| Producer commit (cherry-picked onto upbeat) | `b062626` |
| Webhook env var / GitHub secret name | `MAKE_FREEZE_WEBHOOK` |

---

## What's DONE (no action needed)
1. **Trigger scenario `6171206` rebuilt + hardened.** HTTP module → POST
   `…/actions/workflows/x-poster.yml/dispatches`, body `{"ref":"claude/upbeat-cerf-CJnYx"}`,
   headers incl. real PAT (expires 2026-08-14). Schedule = every **10 min, 24/7**
   (`indefinitely`, `interval: 600`). Active.
2. **Producer code live on `upbeat`** (commit `b062626`):
   - `scripts/lib/context.mjs` — now returns per-team `reasons` (human-readable
     suspensions/injuries/crisis) that were previously log-only.
   - `scripts/update.mjs` — on each NEW pick freeze, builds a `pick_locked` event
     and POSTs it once to `MAKE_FREEZE_WEBHOOK`. Idempotent (one notify per lock);
     **no-op while the secret is unset**, so it's safe that it's already deployed.
   - `.github/workflows/data-pipeline.yml` — passes `MAKE_FREEZE_WEBHOOK` from
     secrets into the run.
   - Event shape includes a ready-to-send `text`, e.g.:
     > 🔒 THE AI locked its pick: Saudi Arabia 1–2 Uruguay (kickoff 22:00 UTC).
     > Context shaped the pick — Uruguay −18: suspended — Núñez (sent off, ×3).
     (No signals → "…pick from base ratings (form & Elo).")
   - Confirmed: news/context **is** read BEFORE the lock (ratings adjusted, then
     `freezeBotPicks`). `CONTEXT_ENABLED` defaults to `1` in the workflow.

---

## TODO tomorrow (laptop) — build the Telegram consumer
Everything below is Make UI / Telegram / GitHub — no code left to write.

### 1. Telegram bot + chat ID
- Telegram → **@BotFather** → `/newbot` → copy the **bot token**.
- Message the new bot once → open `https://api.telegram.org/bot<TOKEN>/getUpdates`
  → copy `result[0].message.chat.id` (or message **@userinfobot**).

### 2. New Make scenario (team 837107) — 2 modules
- **Webhooks ▸ Custom webhook** → *Add* → name `pick-lock` → **copy the URL**.
  (Data structure: "Determine automatically".)
- **Telegram Bot ▸ Send a Text Message or a Reply**:
  - Connection → paste **bot token**.
  - **Chat ID** = your chat ID.
  - **Text** = map the webhook's **`text`** field.
  - Parse mode = default/None.
- **Save** → toggle scenario **ON** (schedule stays *Immediately*).

### 3. GitHub secret
- Repo → Settings → Secrets and variables → Actions → **New repository secret**
  - Name: `MAKE_FREEZE_WEBHOOK`
  - Value: the webhook URL from step 2.

### 4. Test
- Easiest: in Make hit **Run once** on the new scenario, then in another tab POST a
  sample event to the webhook URL (or ask Claude to fire a test POST — paste the
  URL, it's an endpoint not a credential). Confirm the Telegram message looks right.
- Real path: trigger the **`data-pipeline`** workflow (`workflow_dispatch`); if any
  fixture is within the 5h freeze horizon it'll freeze + notify.

---

## Optional: let Claude build the consumer via API
The consumer was going to be built via Make MCP, but **Make-write calls
(`hooks_create`, `scenarios_create`, `connections_list`) return "requires
approval" and don't reach an interactive prompt in the web/remote session** — so
they're effectively blocked here. From a laptop Claude Code session with Make MCP
writes allowed, Claude can create the webhook + Telegram scenario skeleton for you,
leaving only the bot token / chat ID / secret. (Trigger-scenario writes —
`scenarios_update`/`activate` — DID work, so the gate is per-tool.)

---

## Open follow-ups (not blocking)
- **GitHub cron trim:** the gate ("a post-go-live `b2` in `posted.json`") is now MET
  (M014/M016/M013). You said **leave the dense cron another day** — revisit to strip
  the `schedule:` block in `x-poster.yml` (keep `workflow_dispatch`).
- **Disable both Make scenarios after 2026-07-19** (tournament ends).
- **Dedup note:** a lock notifies once because freezes are committed to
  `botPicks.json`; only risk of a duplicate is if a pipeline run freezes+notifies
  but its commit later fails (rare). Acceptable.

## Context docs
`MAKE_XPOSTER_TRIGGER.md` (trigger writeup), `SESSION_HANDOFF.md` (broader project).
