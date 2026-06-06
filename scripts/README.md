# Daily update pipeline

One command keeps the site current through the tournament:

```bash
npm run update          # fetch results + refresh predictions + rebuild
npm run update:commit   # ...then commit & push (Netlify auto-deploys)
```

Run it once each morning (after the previous night's matches finish).

## What it does

`scripts/update.mjs`:

1. **Results** — pulls the official fixture/result feed from
   [openfootball](https://github.com/openfootball/worldcup.json) and writes
   `src/data/results.json` (scores for played matches, keyed to our match IDs).
2. **Predictions** — runs the vendored Elo + Dixon-Coles model
   (`vendor/wc-model/`, see its `NOTICE.md`) over every not-yet-played fixture
   and writes `src/data/predictions.json` (win / draw / loss + expected goals).
   Played results are fed back into the ratings so they stay current.
3. **Build & deploy** — `npm run build`, then (with `--commit`) commits and
   pushes so the deploy refreshes automatically.

## It never hard-fails

- If the feed is unreachable, the last good `results.json` is kept and only
  predictions are refreshed.
- If the model errors, predictions fall back to a FIFA-rank estimate, tagged
  `source: "estimated"` and shown with an **EST** badge in the UI — so an
  estimate is never passed off as the real model.

## Flags

| flag         | effect                                |
| ------------ | ------------------------------------- |
| `--no-build` | regenerate data only, skip Vite build |
| `--commit`   | commit & push after building          |
