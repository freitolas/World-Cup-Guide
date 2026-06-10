# THE AI — WhatsApp predictions bot (spec)

> Pay $5 → receive THE AI's locked scoreline prediction by WhatsApp the moment it
> freezes (15 min before kickoff), for every match through the tournament.
> Branch: `claude/whatsapp-bot`. Reuses the prediction engine + the freeze/
> scheduler from the X poster.

## How it works (delivery — the easy part, reuses what exists)
1. The pick is already frozen in `src/data/botPicks.json` by the daily pipeline
   (immutable, context-adjusted). No new model work.
2. A scheduled job (`scripts/whatsapp-push.mjs`) runs on the SAME dense off-peak
   schedule as the X poster. Each run finds fixtures kicking off within the
   15-min window that haven't been pushed yet, and for each, sends the frozen
   pick to every ACTIVE subscriber. Idempotent (records sent match ids).
3. Message = THE AI's locked scoreline (via an APPROVED WhatsApp template).

## The non-trivial parts (external setup — mostly owner-side)
### A. WhatsApp Business API + template (HARD REQUIREMENT)
- Business-initiated messages (our push) require a **pre-approved message
  template** through Meta. Free-text business-initiated sends are blocked.
  Example template to submit:
  `THE AI's locked prediction for {{1}} vs {{2}}: {{3}}. Public on X in 15 min — you got it first. Reply STOP to opt out.`
- Requires a Meta Business account + WhatsApp Business number + verification.
- **Opt-in is mandatory** — we may only message numbers that explicitly opted in
  (the Stripe checkout consent + a checkbox is the opt-in record).
- STOP/opt-out handling is required (provider usually auto-handles).

### B. Provider — DECISION NEEDED
- **Twilio WhatsApp** (recommended for speed): simple REST, sandbox for testing,
  handles templates via Content API. Per-message + Meta conversation fee.
- **Meta WhatsApp Cloud API** (direct): cheaper at scale, more setup.
- Either way the send is isolated in `scripts/lib/whatsapp.mjs` (one function),
  so the choice only touches that file.

### C. Payment + phone capture — DECISION NEEDED
- **Web landing**: a small page collects WhatsApp number + opt-in consent → $5
  Stripe Checkout → webhook marks the subscriber active. Clean, controllable.
- **WhatsApp-native**: user messages the bot, gets a Stripe payment link, pays →
  active. More native, needs inbound webhook handling.

## Data (Supabase — same project `ahznwacqwfqariiqmorb`)
Proposed table (apply once the signup flow is confirmed):
```sql
create table public.whatsapp_subscribers (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,          -- E.164, e.g. +5511999999999
  active boolean not null default false,
  consent_at timestamptz,              -- opt-in timestamp (required by WhatsApp)
  stripe_customer text,
  expires_at timestamptz,              -- paid through (e.g. final on 2026-07-19)
  created_at timestamptz default now()
);
alter table public.whatsapp_subscribers enable row level security;
-- no public policy: only the service role (push job + webhook) reads/writes.
```

## Secrets the job needs (GitHub Actions)
- `SUPABASE_SERVICE_ROLE_KEY` (read active subscribers, bypass RLS).
- Provider creds: Twilio (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`,
  `TWILIO_WHATSAPP_FROM`, template SID) OR Meta (`WA_PHONE_ID`, `WA_TOKEN`,
  template name).

## Owner setup checklist (before go-live)
- [ ] Meta Business + WhatsApp Business number, verified.
- [ ] Message template submitted + APPROVED.
- [ ] Provider account (Twilio or Meta Cloud API) + creds as secrets.
- [ ] Stripe $5 product/payment link for the WhatsApp tier (separate from the
      game's knockout pass).
- [ ] Decide signup flow (web landing vs WhatsApp-native).

## Status
Skeleton only (`scripts/whatsapp-push.mjs` + `scripts/lib/whatsapp.mjs`,
provider send stubbed, dry-runs). Pending the two decisions above + owner setup.
