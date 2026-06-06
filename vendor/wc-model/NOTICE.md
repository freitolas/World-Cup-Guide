# Vendored prediction model

This directory contains a vendored copy of the open-source
**world-cup-2026-prediction-model** by Hicruben
(https://github.com/Hicruben/world-cup-2026-prediction-model), used under the
MIT License (see `LICENSE`).

## What we use, verbatim

- `elo.mjs` — the match-probability engine (Elo win expectancy + Dixon-Coles
  bivariate Poisson over a 0–8 goal grid). This is the part that turns two team
  ratings into win / draw / loss probabilities. Unmodified.
- `data/elo-calibrated.json` — the model's ratings, calibrated on 920 real
  international results (2023–2026).
- `data/results.json` — the historical match corpus the ratings were calibrated
  from, kept so ratings can be nudged forward as the tournament is played.

## What we adapt, and why

The published model was seeded with a *projected* finalist list that does not
match the actual 2026 draw this site uses. Concretely, its ratings table:

- is **missing 9 teams that actually qualified** — Türkiye, Curaçao, Sweden,
  Cape Verde, Iraq, Norway, Austria, DR Congo, Uzbekistan; and
- includes ~15 teams that did **not** qualify (Italy, Denmark, Poland, Serbia,
  Nigeria, Chile, …).

We therefore do **not** treat its ratings table as the finalist list. Instead,
`scripts/lib/ratings.mjs`:

1. takes the model's calibrated rating for each team it covers (39 of our 48),
2. fills the 9 gaps by regressing Elo against FIFA ranking across the
   overlapping teams, and
3. nudges ratings forward with actual 2026 results as they are played.

A few of our slugs differ from the model's (`cote-divoire`/`ivory-coast`,
`czechia`/`czech-republic`, `bosnia`/`bosnia-and-herzegovina`); the mapping
lives in `scripts/lib/teamMap.mjs`.
