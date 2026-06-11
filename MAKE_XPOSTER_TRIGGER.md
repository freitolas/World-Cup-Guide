# Reliable X-poster trigger (Make → GitHub workflow_dispatch)

## Why
GitHub throttles scheduled workflows **per workflow**, and punishes high-frequency
crons hardest. Observed on opener day: the every-8-min `x-poster.yml` cron fired
only ~5×/20h, so the 15-min Beat-2 window is a coin-flip. `workflow_dispatch`
(manual/API trigger) is **not** throttled. Make is a reliable scheduler. So: Make
polls on a steady clock and fires the poster via the dispatch API; the poster
keeps all its own logic (beats, frozen picks, idempotency, the 15-min window).

## The scenario (2 modules)
1. **Schedule** (trigger) — every **15 minutes**, aligned to the clock (`:00/:15/:30/:45`).
   Kickoffs after the BST→UTC fix land on `:00`/`:30`, so a 15-min aligned poll
   always lands inside each match's 15-min Beat-2 window. Optionally restrict the
   advanced schedule to 16:00–08:00 UTC and to 2026-06-11…2026-07-19.
2. **HTTP → Make a request** (action):
   - **URL:** `https://api.github.com/repos/freitolas/World-Cup-Guide/actions/workflows/x-poster.yml/dispatches`
   - **Method:** `POST`
   - **Headers:**
     - `Accept: application/vnd.github+json`
     - `Authorization: Bearer <GITHUB_PAT>`
     - `X-GitHub-Api-Version: 2022-11-28`
   - **Body (raw JSON):** `{ "ref": "claude/upbeat-cerf-CJnYx" }`
   - Expected response: **204 No Content** = accepted.

That's it. Every 15 min Make pokes GitHub; the poster runs in ~9s and exits fast
when nothing's due (idempotent via `posted.json`). Beat 1/2/3 all benefit.

## Credentials needed (only you can create these)
- **Make team ID** — the number in your Make URL `make.com/.../team/NNNNNN`. Paste it
  and I'll build the scenario via API.
- **GitHub fine-grained PAT** — github.com → Settings → Developer settings →
  Fine-grained tokens → repo `freitolas/World-Cup-Guide` → **Actions: Read and write**.
  Store it in the Make HTTP module's Authorization header (above). Don't paste it in
  chat — put it straight into Make.

## After it's live
- Disable/trim the GitHub `schedule:` cron on `x-poster.yml` (keep it as a backup or
  drop it) — Make is now the clock.
- Disable the Make scenario after **2026-07-19**.
- Same pattern can trigger `data-pipeline.yml` if its 3-hourly freeze ever needs to
  be tighter.
