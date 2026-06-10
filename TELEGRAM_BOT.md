# THE AI — paid Telegram predictions bot (Make-orchestrated)

> Pay $5 → receive THE AI's locked scoreline by Telegram the moment it freezes
> (15 min before kickoff). Branch: `claude/whatsapp-bot`. Telegram (not WhatsApp)
> — no template approval, no per-message fees, instant bot via @BotFather.

## Division of labour
- **Repo (this branch):** `scripts/notify-make.mjs` + `.github/workflows/notify-make.yml`.
  On the same dense 15-min schedule as the X poster, it finds each fixture
  kicking off within 15 min that has a frozen pick and **POSTs one webhook to
  Make** with the pick. Idempotent via `src/data/make-sent.json`. That's all the
  code there is.
  - Webhook payload:
    ```json
    { "matchId": "M001", "teamA": "Mexico", "teamB": "South Africa",
      "pick": [2,0], "score": "2-0", "kickoff": "2026-06-11T20:00:00.000Z" }
    ```
- **Make (you build, visually):** three scenarios — Stripe, Telegram /start, and
  the prediction fan-out.

## Make scenarios to build
1. **Stripe → subscriber (signup).** $5 Stripe Checkout (web landing or payment
   link) → Stripe webhook into Make → create a subscriber row (Make Data Store or
   a Google Sheet) with a unique `token`, `active=false`, paid-through date. The
   Checkout success page deep-links to the bot: `https://t.me/YourBot?start=<token>`.
2. **Telegram /start → link chat_id (opt-in).** Telegram bot (BotFather token) →
   Make "Watch Updates" → on `/start <token>`, match the token to the subscriber,
   store their `chat_id`, set `active=true`. The `/start` is the opt-in.
3. **Webhook → Telegram fan-out (delivery).** Make "Custom webhook" = the
   `MAKE_WEBHOOK_URL` our job calls → for each `active` subscriber, send a
   Telegram message via the bot:
   `🔒 THE AI's locked pick — {{teamA}} {{score}} {{teamB}}. Public on X in 15 min. You got it first.`

## Setup checklist
- [ ] Create the Telegram bot with @BotFather; note the bot token + username.
- [ ] Build the 3 Make scenarios above; get the **Custom webhook URL** from #3.
- [ ] Add repo secret **`MAKE_WEBHOOK_URL`** (Settings → Secrets → Actions).
- [ ] Stripe $5 product/payment link for the Telegram tier (separate from the
      game's knockout pass). Web landing optional (or just the payment link).
- [ ] To activate the GitHub job: merge this branch's `notify-make.yml` to the
      DEFAULT branch (scheduled workflows only fire from default).
- [ ] ⚠️ Disable the workflow after 2026-07-19.

## Test
- `gh`/Actions → run **Notify Make** manually (`workflow_dispatch`); with no
  fixture within 15 min it logs "nothing within 15 min". To smoke-test the
  webhook end-to-end, temporarily widen `WINDOW_MS` or point a fixture's kickoff
  near now, and watch Make receive the payload.

## Status
Repo side complete (webhook firer + workflow, dry-runs without the secret).
Pending: the Make scenarios + Telegram bot + `MAKE_WEBHOOK_URL` + merge-to-default
to activate.
