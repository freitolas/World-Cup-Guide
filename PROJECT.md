# World Cup 2026 Fan Guide — Project Reference

> Single-source overview of how this website is built, what it contains, how it
> updates itself, and where it's heading (paywall). Intended as Claude-project
> knowledge. Last updated: 2026-06-06.

---

## 1. What it is

An **unofficial** fan guide to the 2026 World Cup (hosts: USA · Mexico · Canada,
11 Jun – 19 Jul 2026). It's a single-page web app covering fixtures, the 12
groups, all 48 teams, a large player database, host-city/venue guides, and
**statistical match predictions** (win/draw/loss + expected goals).

It is **not affiliated with FIFA** — branding deliberately avoids FIFA marks and
carries a disclaimer (see §9).

- **Live hosting:** Netlify (project `worldcupguide`), auto-publish on push.
- **Repo:** `freitolas/World-Cup-Guide` (private).

---

## 2. Tech stack

| Layer | Choice |
|---|---|
| UI | React 19 (single compiled-JSX component, see §8) |
| Build | Vite 6 (`@vitejs/plugin-react`) |
| Styling | Inline styles (the `index.css` is empty); theme tokens: gold `#f4b942`, dark `#0d1525` |
| Data pipeline | Node ESM scripts (`scripts/`) |
| Prediction engine | Vendored MIT Elo + Dixon-Coles model (`vendor/wc-model/`) |
| Hosting | Netlify (serves committed `dist/`, **no build on Netlify's side**) |
| CI / automation | GitHub Actions (daily update job) |
| Planned auth/payments | Supabase (auth/DB) + Stripe (subscriptions) — not built yet |

There are **only two runtime dependencies** (`react`, `react-dom`). Phase 1
additions (PWA, cookie consent) are deliberately **dependency-free**.

---

## 3. Architecture & deploy model (important)

The single most important architectural fact:

> **`netlify.toml` has `publish = "dist"` and no build command.** Netlify does
> **not** build the site — it serves the **committed `dist/` directory** as-is.

Consequences:
- The build (`vite build`) runs in **our GitHub Action**, which commits the
  regenerated `dist/` and pushes. Netlify then auto-publishes that push.
- `dist/` is **committed to git** (not gitignored). Always rebuild before
  committing data/UI changes.
- The deploy loop is: **edit → `npm run build` → commit `dist/` → push → Netlify
  republishes.**

---

## 4. Repository structure

```
World-Cup-Guide/
├── index.html              # App shell + PWA meta tags (title, manifest, icons)
├── netlify.toml            # publish = "dist" (no build cmd — serves committed dist)
├── vite.config.js          # Vite + React plugin
├── package.json            # scripts: dev/build/preview/update/update:commit
├── PROJECT.md              # this file
│
├── public/                 # copied verbatim to dist/ root
│   ├── favicon.svg         # site favicon
│   ├── app-icon.svg        # 512 maskable PWA icon (Phase 1)
│   ├── manifest.webmanifest# PWA manifest (Phase 1)
│   ├── sw.js               # service worker, network-first (Phase 1)
│   ├── legal.css           # shared styling for legal pages (Phase 1)
│   ├── terms.html          # Terms of Service draft (Phase 1)
│   ├── privacy.html        # Privacy Policy draft (Phase 1)
│   ├── cookies.html        # Cookie Policy draft (Phase 1)
│   └── refunds.html        # Cancellation & Refund Policy draft (Phase 1)
│
├── src/
│   ├── main.jsx            # React entry; registers SW + install prompt + cookie consent
│   ├── App.jsx             # ENTIRE UI, ~3360 lines, compiled-JSX style (see §8)
│   ├── index.css           # empty (styles are inline)
│   ├── pwa.js              # SW registration + install/add-to-home affordances (Phase 1)
│   ├── cookie-consent.js   # UK GDPR/PECR consent banner (Phase 1)
│   └── data/
│       ├── index.js        # re-exports all data
│       ├── groups.js       # 12 groups A–L, 4 team slugs each
│       ├── matches.js      # fixtures: id (M001…), date, time, home, away, group, venue, matchday
│       ├── teams.js        # 48 teams: slug, name, flag (emoji), history, verdict, etc.
│       ├── players.js       # large player DB (~10k lines) keyed by player id
│       ├── featured.js     # list of ~18 featured player ids
│       ├── venues.js       # 16 host cities/stadiums
│       ├── predictions.json# GENERATED — per-match win/draw/loss + eg + source
│       └── results.json    # GENERATED — scores for played matches (empty until kickoff)
│
├── scripts/                # daily update pipeline (see §6)
│   ├── update.mjs          # orchestrator
│   ├── lib/ratings.mjs     # team rating table (model + gap-fill + result nudging)
│   ├── lib/teamMap.mjs     # name/slug reconciliation
│   └── README.md
│
├── vendor/wc-model/        # vendored prediction model (MIT)
│   ├── elo.mjs             # Elo win-expectancy + Dixon-Coles bivariate Poisson
│   ├── data/elo-calibrated.json   # calibrated ratings (920 results, 2023–26)
│   ├── data/results.json   # historical corpus
│   ├── LICENSE             # MIT (Cup26 AI / Hicruben)
│   └── NOTICE.md           # what we use/adapt and why
│
└── .github/workflows/
    └── daily-update.yml    # scheduled + manual daily update job
```

---

## 5. Data model

- **Slugs** are the join key everywhere (e.g. `argentina`, `cote-divoire`,
  `czechia`). Groups, matches, teams and players all reference team slugs.
- **Match IDs** are `M001`, `M002`, … Predictions and results are keyed by
  these IDs.
- **`predictions.json`** shape, per match:
  ```json
  "M001": { "win": 0.783, "draw": 0.166, "loss": 0.051, "eg": [2.33, 0.48], "source": "model" }
  ```
  - `win/draw/loss` are from the home team's perspective.
  - `eg` = expected goals `[home, away]`.
  - `source` = `"model"` (real engine) or `"estimated"` (rank-based fallback,
    shown with an **EST** badge).
- **`results.json`** holds scores for played matches; empty (`{}`) until the
  tournament starts.
- Flags are **Unicode emoji** (no image assets) — avoids flag/crest licensing.

---

## 6. Daily update pipeline (`scripts/`)

Commands (from `package.json`):
```bash
npm run update          # fetch results + refresh predictions + rebuild dist
npm run update:commit   # ...then commit & push (Netlify auto-deploys)
```

`scripts/update.mjs` does three things:
1. **Results** — fetches the official feed from
   [openfootball](https://github.com/openfootball/worldcup.json)
   (`.../2026/worldcup.json`) → writes `src/data/results.json`.
2. **Predictions** — runs the vendored Elo + Dixon-Coles engine over every
   not-yet-played fixture → writes `src/data/predictions.json`. Played results
   are fed back so ratings stay current.
3. **Build & deploy** — runs `vite build`; with `--commit`, commits + pushes.

**Flags:** `--no-build` (data only), `--commit` (commit & push after build).

**Never hard-fails:**
- Feed unreachable → keep last good `results.json`, refresh predictions only.
- Model error → fall back to a FIFA-rank estimate, tagged `source:"estimated"`
  (EST badge). An estimate is never passed off as the real model.

### The rating layer (`scripts/lib/ratings.mjs`)
The published model rated only **39 of our 48** finalists (it was seeded with a
*projected* finalist list — included teams that didn't qualify like Italy/
Denmark/Nigeria, and missed 9 that did: Türkiye, Curaçao, Sweden, Cape Verde,
Iraq, Norway, Austria, DR Congo, Uzbekistan). So `ratings.mjs`:
1. uses the model's calibrated rating where it covers a team (39/48),
2. fills the **9 gaps** by regressing Elo on FIFA ranking across overlapping
   teams,
3. nudges ratings forward with actual 2026 results as they're played.

`scripts/lib/teamMap.mjs` reconciles openfootball names ↔ our slugs ↔ the
model's slugs (e.g. `cote-divoire`/`ivory-coast`, `czechia`/`czech-republic`,
`bosnia`/`bosnia-and-herzegovina`). Knockout placeholders are skipped until they
resolve.

---

## 7. Automation & deployment

- **`.github/workflows/daily-update.yml`**: runs `npm run update:commit` on a
  schedule (`cron: 0 8 * * *` ≈ 09:00 BST) and on manual `workflow_dispatch`.
  Steps: checkout → setup-node 22 → `npm ci` → configure git bot → update.
  Needs `permissions: contents: write`. Commits only when data actually
  changed (no-op on quiet days).
- **Netlify** auto-publishes from the default branch
  `claude/rep9-netlify-repo-setup-OkyiX`. Scheduled Actions run from that same
  default branch and commit back to it → push triggers auto-publish.
- Verified end-to-end: a manual run completed green; on a quiet (pre-tournament)
  day it correctly made no commit.

---

## 8. The UI (`src/App.jsx`)

- The **entire app is one large file in compiled-JSX style** — calls look like
  `(0, f.jsx)(T, { children: … })` with single-letter component aliases
  (`T`, `le`, `E`, `D`, `Re`, etc.). It reads like build output committed as
  source. **Edit it surgically** (string/section edits), matching that style;
  don't try to "prettify" it.
- **Navigation:** a fixed bottom nav with 6 tabs — Home, Today, Search, Teams,
  Players, Cities. Detail pages (player/team/city/group) render via a
  `navigate(type, id)` helper. A view-switch (`e === 'home'`, etc.) renders the
  active tab.
- **Today tab:** today's matches with predictions; on empty days, next-up
  fixtures + a kickoff countdown, plus a yesterday's-results recap.
- **Fixture cards:** show the scoreline once played and a win/draw/loss
  probability bar beforehand (EST badge for fallback predictions).
- A **global footer** (added Phase 1) carries the disclaimer, legal links, and
  a "Cookie settings" button; it renders on tab views (not detail pages).

---

## 9. Phase 1 (done) — rebrand, PWA, consent, legal

Branch `claude/upbeat-cerf-CJnYx`. All dependency-free.

1. **Unofficial rebrand:** removed "FIFA" from title, masthead, group header and
   nav logo; added a persistent "Unofficial" marker and a footer disclaimer
   ("Not affiliated with… FIFA"; "predictions are estimates, not betting
   advice"; "data via openfootball"). Factual references ("won the 2022 World
   Cup") are retained as legitimate nominative use.
2. **Installable PWA:** `manifest.webmanifest`, maskable `app-icon.svg`,
   network-first `sw.js` (keeps daily data fresh, offline fallback), an
   Android/desktop install button and an iOS "Add to Home Screen" hint
   (`src/pwa.js`).
3. **Cookie consent (UK GDPR/PECR):** banner in `src/cookie-consent.js` —
   strictly-necessary by default, analytics gated behind opt-in, reopenable from
   the footer. Helper `hasConsent('analytics')` for future scripts.
4. **Legal pages:** static `terms/privacy/cookies/refunds.html` linked from the
   footer, written around the real stack. **They are DRAFT templates** with
   `[PLACEHOLDERS]` (business name, contact email, date) and a visible
   review-needed banner — not legal advice.

**Caveats / follow-ups:** legal placeholders must be filled & reviewed; PWA
icons are SVG-only (PNGs would improve iOS home-screen quality); nothing is
paywalled yet (Phase 1 is branding + infrastructure only).

---

## 10. Phase 2 (planned) — paywall (Stripe + Supabase)

**Decided gating model:** *Group stage fully free (including its predictions).
The entire knockout section is locked — its fixtures, results and predictions.*

- **Truly protected asset = knockout predictions.** Everything else (incl.
  knockout fixtures/results) is only soft-locked in the UI; it's acceptable if
  that non-prediction data is "stolen."
- **Cost guarantee:** free users are served **only** the static Netlify CDN and
  never touch Supabase, so free traffic costs £0. Supabase is hit only on
  signup/payment/entitlement checks and to serve the tiny gated predictions
  payload — load scales with paying users only.
- **Pipeline change required:** stop publishing knockout predictions into the
  public `dist/`; write them to Supabase (served via an authenticated query).
  Group predictions stay public/static.

**Architecture:**
```
User → Supabase Auth (signup/login)
     → Stripe Checkout (subscription, trial_period_days: 1)
     → Stripe webhook → Supabase Edge Function → entitlement row
     → app checks entitlement before revealing knockout content/predictions
     + Stripe Customer Portal for self-serve cancel
```

**To build Phase 2, needed from owner:**
1. Supabase: project URL + anon key (+ service-role key as a secret, not
   committed).
2. Stripe: a subscription Product/Price with a 1-day trial; publishable +
   secret keys; webhook signing secret.

---

## 11. Licensing & legal posture

| Component | License | Commercial OK |
|---|---|---|
| react/react-dom/vite/plugin-react | MIT | ✅ |
| Vendored model (`vendor/wc-model`) | MIT (explicitly "…and/or sell") | ✅ keep LICENSE + NOTICE |
| Flags | Unicode emoji | ✅ no licensing |
| openfootball results | Public-domain dedication (verify) | ✅ likely |
| FIFA rankings (in `ratings.mjs`) | facts, not copyrightable | ✅ numbers only; no FIFA logos |

**#1 legal risk:** the "FIFA" trademark. Mitigated in Phase 1 by dropping FIFA
branding, adding an "unofficial / not affiliated" disclaimer, and avoiding FIFA
marks in any domain name. Use descriptive phrasing ("2026 World Cup guide"), not
official marks, as the product identity.

---

## 12. Costs (web-only model)

| Item | Cost |
|---|---|
| Domain (e.g. Cloudflare Registrar) | ~£10/yr |
| Netlify hosting | £0 (free tier) |
| Supabase | £0 to start |
| Stripe | £0 fixed; ~2.9% + 20p per charge |
| **Total fixed** | **~£10/yr + transaction fees** |

(Web + Stripe deliberately avoids native-app costs: no $99/yr Apple, no $25
Google, no 15–30% store commission.)

---

## 13. Branches & conventions

- **Default / deploy branch:** `claude/rep9-netlify-repo-setup-OkyiX` (Netlify
  publishes from here; scheduled Action runs here).
- **Active dev branch:** `claude/upbeat-cerf-CJnYx` (Phase 1 + stacking Phase 2).
- **Editing rules:** rebuild `dist/` before committing; edit `App.jsx`
  surgically in its compiled style; data lives in `src/data/*` (generated files:
  `predictions.json`, `results.json`); keep new modules clean/readable.
- **Do not** commit secrets; Supabase/Stripe keys go in GitHub/Netlify/Supabase
  secret stores.
