# Session handoff — resume here (2026-06-08)

Working branch `claude/admiring-curie-UYl3h`; **default + deploy branch is
`claude/upbeat-cerf-CJnYx` (upbeat)** — push to both (fast-forward upbeat).

## State (all built, committed, deployed on upbeat)
- Game = `game/` → humansareinferior.com (Netlify, deploys from upbeat). Apex SSL OK.
- V2 cold-dark redesign, phase-aware hero record, leaderboard (`/leaderboard`,
  empty taunt until backend), real X embed feed, first-party UTM attribution
  (`profiles.attribution` jsonb; funnel query in `HANDOFF.md`).
- **X auto-poster (3-beat)** in `scripts/post-picks.mjs` + `scripts/lib/postToX.mjs`,
  content in `src/data/x-content.json`, log `src/data/posted.json`. Workflow
  `.github/workflows/post-picks.yml` (default branch, X_* secrets set, **X now funded**).

## DO FIRST next session
1. **Test post (X now funded):** trigger `post-picks.yml` via `mcp__github__actions_run_trigger`
   (`run_workflow`, ref upbeat, inputs `{test:"true"}`), then read job logs to confirm a
   real tweet id. Owner asked for a generic teaser test — current `--test` line is a
   generic "Systems online…" teaser (fine), or swap copy first.
2. **Adopt the corrected Beat-1 deck** (`BEAT1_CORRECTED_DECK.md`, 72 verbatim tweets,
   owner-fixed pairings + handles). Steps:
   - Parse those 72 lines → map to fixtures **by team pair** (handles or names), QA
     fail-loudly that all 72 group fixtures are covered and pairings are real.
     (Earlier the OLD deck only matched ~20/72; this corrected one should be ~72/72 —
     VERIFY.) Watch name↔slug: "Korea Republic"→south-korea, "Cabo Verde"→cape-verde,
     "Congo DR"/"Côte d'Ivoire"/"IR Iran"/"Türkiye"/"Bosnia and Herzegovina".
   - Store Beat-1 as **verbatim per-fixture strings** in `x-content.json` (replace the
     generated bank) — links/tags are already authored in, so post as-is.
   - Harvest the **full 48 team→handle map** from this deck (it includes the 12 that
     were missing: turkey @MilliTakimlar, panama @fepafut, cote-divoire @FIFCI_tweet,
     algeria @LesVerts, saudi-arabia @SaudiNT_EN, uzbekistan @UzbekistanFA, iraq @IRAQFA,
     curacao @CuracaoFutbol, cape-verde @FCF_CaboVerde, norway @nff_info, jordan @JordanFA,
     dr-congo @fecofa_kinshasa). Used for Beat 2/3 tags.
   - Engine change: Beat 1 = look up the fixture's verbatim string (not template);
     keep Beat 2/3 tokenized as-is. Re-run the copy-preview check, commit, push both.

## Still owner-side
- Mark @inferiorhumans as an **automated account** in X settings.
- Optional: verify all 48 handles current.

## Notes
- Link policy now = deck's odd/even alternation (superseded the date-based A/B). UTM
  links carry `utm_source=x&utm_campaign=ai_picks&utm_content=<matchId>`.
- Stripe payment still unfinished (`STRIPE_BACKLOG.md`).
