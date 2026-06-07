# Stripe payment — backlog (pick up in a fresh session)

> Goal: finish the **$5 one-time "knockout pass"** for the Game
> ("Humans Are Inferior"). The backend + front-end are already built and pushed;
> only the Stripe wiring is missing. Read `HANDOFF.md` and `PROJECT.md` for full
> context. Work on branch **`claude/upbeat-cerf-CJnYx`**.

## Why this is blocked
In the session that built this, a `ToolSearch` for `stripe` returned **no tools**
— the Stripe MCP was not reachable (only Meta Ads + ClickUp MCPs were connected),
despite the owner authorising it. **First thing to do:** run
`ToolSearch "stripe create payment link"` and confirm Stripe MCP tools are
actually present this time. If they are, do step 1 via MCP; if not, the owner
creates the link in the Stripe dashboard and pastes the URL.

## What's ALREADY built (don't rebuild)
- **Supabase** project "Humans Are Inferior" = `ahznwacqwfqariiqmorb` (eu-west-1).
- Table `public.entitlements (user_id, tier, source, expires_at, …)`, RLS on;
  written only by the webhook (service role). `profiles`, `picks` also exist.
- **Edge function `stripe-webhook`** deployed and ACTIVE (verify_jwt off, verifies
  Stripe signature, upserts entitlement). URL:
  `https://ahznwacqwfqariiqmorb.supabase.co/functions/v1/stripe-webhook`
  - It reads env: `STRIPE_WEBHOOK_SECRET` (required), `STRIPE_SECRET_KEY`
    (optional), `ENTITLEMENT_EXPIRES_AT` (defaults `2026-07-19T23:59:59Z`),
    and the auto-injected `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`.
  - On `checkout.session.completed` with `payment_status` paid, it upserts
    `entitlements` keyed by `session.client_reference_id` (= the Supabase user id).
- **Front-end** (`game/`):
  - `game/src/supabaseClient.js` exports `STRIPE_PAYMENT_LINK`
    (from `import.meta.env.VITE_STRIPE_PAYMENT_LINK`, default `''`).
  - `game/src/components/Knockouts.jsx` (`#/knockouts`) builds the checkout URL as
    `${STRIPE_PAYMENT_LINK}?client_reference_id=<user.id>&prefilled_email=<email>`
    and shows "not yet available" while the link is unset. Entitlement gating via
    `useEntitlement` in `game/src/auth.js`.

## TODO to finish (in order)
1. **Create a $5 one-time Payment Link** (currency per owner; brief says "$5").
   - Via Stripe MCP if tools are present, **or** owner makes it in dashboard
     (Products → one-time $5 → Payment Links) and provides the URL.
   - Payment Links support `client_reference_id` as a query param — good, that's
     how the webhook ties payment to the user. Keep the link's "after payment"
     redirect pointing back to the live site (e.g. `…/#/knockouts`).
2. **Add the webhook in Stripe** → endpoint = the `stripe-webhook` URL above,
   event **`checkout.session.completed`**. Copy the **signing secret** (`whsec_…`).
3. **Set Supabase Edge Function secrets** (Dashboard → Project → Edge Functions →
   Secrets, or `supabase secrets set`): `STRIPE_WEBHOOK_SECRET=whsec_…`
   (optionally `STRIPE_SECRET_KEY=sk_…`). No redeploy needed; secrets are read at
   invocation.
4. **Wire the link into the front-end:** set `VITE_STRIPE_PAYMENT_LINK` as a build
   env var on the Game's Netlify site **or** hardcode the default in
   `game/src/supabaseClient.js` (the Payment Link URL is public — safe to commit).
   Rebuild.
5. **Test end-to-end (Stripe test mode first):** sign in at `#/account` → go to
   `#/knockouts` → pay → confirm the webhook fires (Stripe dashboard → webhook
   logs) and a row appears in `entitlements` → `#/knockouts` shows "Unlocked".
   Then switch to live keys/link.

## Dependencies / gotchas
- The Game isn't deployed to Netlify yet — auth + post-payment redirect want a
  real URL. Publishing the Game (own Netlify site, base dir `game`) and adding
  that URL to **Supabase → Auth → URL Configuration** is a prerequisite for the
  full live test.
- Never commit secret keys (`sk_…`, `whsec_…`, service-role). Publishable key +
  project URL + Payment Link URL are public and fine.
- Entitlement expiry is end-of-tournament; change via `ENTITLEMENT_EXPIRES_AT`.
