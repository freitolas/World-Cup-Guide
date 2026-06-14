# Reliable X-poster trigger (Make → GitHub workflow_dispatch)

## Status (2026-06-14)
**Scenario rebuilt via Make API.** Scenario `6171206` ("humans are inferior",
team `837107`) now has a single **HTTP → Make a request** module on an
**every-15-minutes / 24-7** schedule (`type: indefinitely`, `interval: 900`).
The old empty incoming-webhook module (hard error) is gone; `isinvalid` is now
`false`.

**Still inactive — needs the owner to finish two steps (only you can do these):**
1. Open the scenario → HTTP module → **Authorization** header. Replace the
   placeholder value `Bearer REPLACE_WITH_GITHUB_PAT` with `Bearer <your real
   fine-grained PAT>` (see Credentials below). Don't paste the PAT in chat.
2. **Run this module once** → expect **204 No Content** → then toggle the
   scenario **Active**.

## Why
GitHub throttles scheduled workflows **per workflow**, and punishes high-frequency
crons hardest. Observed on opener day: the every-8-min `x-poster.yml` cron fired
only ~5×/20h, so the 15-min Beat-2 window is a coin-flip. `workflow_dispatch`
(manual/API trigger) is **not** throttled. Make is a reliable scheduler. So: Make
polls on a steady clock and fires the poster via the dispatch API; the poster
keeps all its own logic (beats, frozen picks, idempotency, the 15-min window).

## The scenario (as built)
The scenario schedule **is** the clock — there is no separate trigger module, just
the one HTTP action driven by the scenario's own schedule.
1. **Schedule** — every **15 minutes, 24/7** (`type: indefinitely`, `interval:
   900`). **No time restriction** on purpose: Beat 1 fires from ~10:00 UTC and
   Beat 3 lands the next morning, so a 16:00–08:00 window would clip them; 24/7
   also dodges BST/UTC edge bugs. Off-window polls are cheap (~9s no-ops, gated by
   the poster's date-gate + `posted.json`).
2. **HTTP → Make a request** (`http:ActionSendData`):
   - **URL:** `https://api.github.com/repos/freitolas/World-Cup-Guide/actions/workflows/x-poster.yml/dispatches`
   - **Method:** `POST`
   - **Body type:** Raw · **Content type:** JSON
   - **Headers:**
     - `Accept: application/vnd.github+json`
     - `Authorization: Bearer <GITHUB_PAT>`  ← currently the placeholder `REPLACE_WITH_GITHUB_PAT`
     - `X-GitHub-Api-Version: 2022-11-28`
     - `User-Agent: make-x-poster-trigger`  (GitHub's API rejects requests with no User-Agent)
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
- Keep the GitHub `schedule:` cron on `x-poster.yml` as a backup **until a `b2`
  entry first appears in `posted.json` on a real match** (proof Beat 2 auto-fired
  via the Make poll). Then trim/disable the cron — Make is the clock.
- Disable the Make scenario after **2026-07-19**.
- Same pattern can trigger `data-pipeline.yml` if its 3-hourly freeze ever needs to
  be tighter.
