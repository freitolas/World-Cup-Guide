# Reliable X-poster trigger (Make → GitHub workflow_dispatch)

## Why (confirmed with run data, 2026-06-14)
GitHub throttles **scheduled** workflows hard, and punishes high-frequency crons
worst. The `x-poster.yml` cron asks for ~112 runs/day
(`7,15,23,31,39,47,55 16-23,0-7 * * *`). What GitHub actually fired:

| Date            | schedule runs in 24h |
|-----------------|----------------------|
| 2026-06-11 (opener) | **6** |
| 2026-06-12          | 7 |
| 2026-06-13          | 9 |

That's ~1 run every 2–4 hours — so the **15-minute Beat-2 window is almost never
hit**. Proof in `src/data/posted.json`: M001 and M002 each posted **Beat 1 only**;
the locked pick (Beat 2) and the result/brag (Beat 3) never auto-fired.

`workflow_dispatch` (manual/API trigger) is **not** throttled. Make is a reliable
clock. So: Make polls every 15 min and fires the poster via the dispatch API; the
poster keeps all its own logic (beats, frozen picks, idempotency via `posted.json`,
the 15-min window). Each dispatch runs in ~9s and exits fast when nothing is due.

## The scenario — ONE module, driven by the scenario schedule
In Make the schedule is a **scenario-level setting**, not a flow module. So the flow
is a single **HTTP → Make a request** module; the clock lives in the scenario's
scheduling.

**HTTP module (“Make a request”):**
- **URL:** `https://api.github.com/repos/freitolas/World-Cup-Guide/actions/workflows/x-poster.yml/dispatches`
- **Method:** `POST`
- **Headers:**
  - `Accept: application/vnd.github+json`
  - `Authorization: Bearer <GITHUB_PAT>`
  - `X-GitHub-Api-Version: 2022-11-28`
  - `User-Agent: make-x-poster-trigger`  ← GitHub rejects requests with no UA
- **Body type:** Raw · **Content type:** JSON (application/json)
- **Body:** `{ "ref": "claude/upbeat-cerf-CJnYx" }`  ← the default/deploy branch
- Expected response: **204 No Content** = accepted.

**Scenario schedule:** Every **15 minutes**, **24/7** (no time restriction).

> ### Why 24/7 and NOT the old "16:00–08:00 UTC" restriction
> Kickoffs span **16:00–04:00 UTC**. Beat 1 fires up to **6h before** kickoff (so
> as early as **10:00 UTC**) and Beat 3 fires **after full time** (as late as the
> next morning, once `data-pipeline.yml` writes the result). A 16:00–08:00 window
> would clip both. Running 24/7 also removes the BST↔UTC timezone footgun in Make's
> scheduler. Off-window polls are cheap: the workflow's date-gate
> (`2026-05-19…2026-07-20`) + `posted.json` idempotency make them ~9s no-ops.

## Current state of the scenario (what's broken)
Make scenario **`6171206`** ("humans are inferior", team `837107`) is half-built:
- Its only module is an **incoming webhook** (`gateway:CustomWebHook`) with an
  **empty value** → blocking error "Webhook: Value must not be empty."
- Schedule is `immediately` (wrong).
- It is **inactive**.

**Fix = replace that webhook module with the HTTP module above, set the 15-min
schedule, add the PAT, activate.**

## Credentials (owner-only — I can't create these)
- **GitHub fine-grained PAT** — github.com → Settings → Developer settings →
  Fine-grained tokens → repo `freitolas/World-Cup-Guide` → **Actions: Read and
  write**. Paste it straight into the Make HTTP module's `Authorization` header
  (`Bearer <token>`). **Don't paste it in chat.**

## Two ways to apply the fix
**A. I rebuild it via the Make API (fastest).** Approve the Make MCP write calls
when prompted (in this environment they were being auto-denied with "MCP tool call
requires approval"). Then I'll overwrite scenario `6171206` with the blueprint
above. You still add the PAT + flip Active (so the secret never touches chat).

**B. Manual, ~2 minutes in the Make UI:**
1. Open scenario `6171206` → delete the broken webhook module.
2. Add module **HTTP → Make a request**; fill the fields above.
3. Click the trigger clock → **Every 15 minutes**, no advanced restriction.
4. Paste your PAT into the `Authorization` header.
5. Toggle the scenario **Active**. (Right-click the module → *Run this module
   once* to confirm a `204`.)

## After it's live
- Confirm a real dispatch lands inside a Beat-2 window (check `posted.json` gets a
  `b2` entry on the next match), then **trim/disable the GitHub `schedule:` cron**
  in `x-poster.yml` — Make is the clock. **Keep the cron until Make is verified
  live** (right now it's the only thing firing, throttled as it is).
- Disable the Make scenario after **2026-07-19** (end of tournament).
- Same pattern can trigger `data-pipeline.yml` if its 3-hourly freeze ever needs to
  be tighter.
