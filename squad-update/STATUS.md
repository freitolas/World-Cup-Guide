# Squad Update — Working Status & Next-Session Plan

> Self-contained handoff. A future session may start with **no memory of the chat that
> created this file**, and the container is recreated fresh each session (uploads are
> lost; only committed files survive). Everything needed to finish is captured here.

Branch: `claude/quirky-mendel-G4sgD`  ·  Last updated: 2026-06-05

---

## 1. The task (short version)

Update the "FIFA World Cup 2026 Fan Guide" web app so every one of the 48 teams has its
full official squad (~23–26 players each, ≥3 GK), instead of only ~449 hand-picked stars.
Full brief: `squad-update/CLAUDE_CODE_TASK.md`. Rating rules: `squad-update/RATING_RUBRIC.md`.

The 9 "gold-standard" exemplar teams are already provided as JSON and must be reused:
- `squad-update/squads_data_England_SAMPLE.json` — England (Group L)
- `squad-update/squads_data_GroupA.json` — Mexico, South Africa, South Korea, Czechia
- `squad-update/squads_data_GroupB.json` — Canada, Bosnia and Herzegovina, Qatar, Switzerland

The other **39 teams** must be built from the official FIFA squads (see §5 source rule).

## 2. How this site is actually built (IMPORTANT — not what the brief assumes)

- The repo's "source" is the **compiled `dist/` bundle**, committed to GitHub. **There is
  no separate React/Vite source project.** Netlify serves the committed `dist/` directly
  (`netlify.toml` → `publish = "dist"`, **no build command**). Updating the live site =
  committing a new `dist/`.
- `dist/assets/index-BgiWlpiW.js` (≈374 KB, minified, React + app in one file) holds ALL
  app logic and data. `dist/assets/index-x1XGuNl0.css` is 1 byte — **all styling is inline
  `style={{…}}` objects** inside the components.
- The app is React using the jsx-runtime (`(0,f.jsx)(…)` / `(0,f.jsxs)(…)` calls), with
  `useState`/`useMemo`, a tab/nav stack, search, `localStorage` favourite team
  (`wc2026_fav`), and a back-button stack. Keep all of this.

### Data model recovered from the bundle
All data lives as JS array/object literals inside the bundle. Variable names (minified):

- **`v`** = teams array (48 teams). Each:
  `{ id, name, confederation, rank, coach, nickname, flag, group, style, history,
     verdict, strength, weakness }`
  - `id` is a slug, e.g. `england`, `south-africa`, `cote-divoire`, `dr-congo`, `turkey`.
  - `rank` (FIFA-ish rank int) drives the rating bonus — see `C` below.
  - The 48 teams + 12 groups **already match brief §7 exactly** (verified). Group map is
    array **`ne`** = `[{id:'A',teams:['mexico','south-africa','south-korea','czechia']}, …]`.
- **`y`** = players array (449 currently). Each:
  `{ id, name, pos, team, age, club, desc }`
  - `team` = the team `id` slug. `id` = player slug. `desc` = one-line bio (app voice).
  - **No stored ratings.** Overall + 6 stats are COMPUTED at render time.
- **`ee`** = manual rating-override map for ~18 superstars, keyed by player id:
  `{ messi:{ov,pa,sh,ps,dr,df,ph,bd:[badges]}, mbappe:{…}, … }`. `bd` = badge codes
  (e.g. `WC`,`UCL`,`BD`,`EURO`,`WCG`). Array **`x`** lists those featured star ids.
- **`S`** = position → base-stat table `[pac, sho, pas, dri, def, phy]`:
  ```
  Goalkeeper:[55,20,65,35,82,70]   Centre-Back:[62,40,68,55,82,82]
  Left Back:[76,55,72,70,74,70]    Right Back:[76,55,72,70,74,70]
  Defender:[65,42,66,58,80,80]     Midfielder/Def:[72,60,80,72,78,78]
  Midfielder:[68,65,80,72,65,74]   Attacking Mid:[68,74,82,80,40,60]
  Winger:[82,72,73,83,35,62]       Forward:[75,80,70,78,30,68]
  Forward/Mid:[72,76,76,80,42,68]
  ```
- **`C(player)`** = rating function. If `ee[id]` exists → use it. Else: base = `S[pos]`,
  add team-rank bonus `n` (rank ≤5:+6, ≤10:+4, ≤20:+2, ≤35:0, else −2), add a deterministic
  per-player hash jitter, clamp 40–99, then compute `ov` as a position-weighted blend.
  Returns `{ov,pa,sh,ps,dr,df,ph,bd}`. **So any player added to `y` is auto-rated** — you
  only must supply `pos`, `team`, and ideally a good `id`; `desc` is the editorial bio.
- **`te(rating)`** = rating→colour. There is also city/food/travel data (`eat`,`tip`, etc.)
  and styled wrapper components (single-letter vars like `le`,`E`,`T`,`he`,`ge`).

### Position vocabulary (the app's `pos` values — NOT the FIFA GK/DF/MF/FW codes)
`Goalkeeper, Centre-Back, Left Back, Right Back, Defender, Midfielder, Midfielder/Def,
Attacking Mid, Winger, Forward, Forward/Mid`. **The exemplar JSON + FIFA source use
GK/DF/MF/FW** — these must be MAPPED to the verbose values so `S[pos]` resolves
(unknown pos falls back to Midfielder). Suggested mapping, refined per player using the
club/role from the source:
- `GK` → `Goalkeeper`
- `DF` → `Centre-Back` (or `Left Back`/`Right Back` if clearly a full-back; else `Defender`)
- `MF` → `Midfielder` (or `Attacking Mid` / `Midfielder/Def` by role)
- `FW` → `Forward` (or `Winger` if a wide attacker)

## 3. Decisions locked with the user (Rafa)

1. **Build approach: reconstruct editable source from the bundle, then keep Netlify as-is
   — build locally and commit the regenerated `dist/`.** Do NOT add a Netlify build command;
   do NOT switch Netlify to auto-build (lowest risk; live site only moves when a working
   `dist/` is committed). Bonus goal: leave real editable source in the repo so future
   edits aren't surgery on a minified file.
2. **Data source: scrape directly.** The session that does the work must have **network
   access** (this is why the env is being recreated). Source of truth = the FIFA-published
   squads via `https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_squads`. **Never invent or
   guess squad membership** — if the page can't be fetched, STOP and ask Rafa to paste it.
3. Match the **app's existing data model**, don't impose the brief's literal
   `app:{overall,stats,…}` schema. Concretely: add players to `y` as
   `{id,name,pos,team,age,club,desc}` and let `C` rate them. For the **9 exemplar teams**,
   ingest their hand-set overalls/stats by adding `ee` overrides (so England/Group A/B keep
   gold-standard values). For other teams, add `ee` overrides only for genuine featured
   stars (1–4 per team); depth players ride the computed `C` rating.

## 4. Network constraint that shaped sequencing

The session that wrote this had **no outbound network** (every fetch 403s, incl. example.com)
— so it could neither scrape the squads NOR `npm install` to verify a rebuild. Hence the
real work waits for a **network-enabled session**. What was done here: persisted the input
files (above) + this plan into the repo so nothing is lost. The live `dist/` was **left
untouched**.

## 5. NEXT-SESSION PLAN (do this when network is available)

0. Confirm network: fetch the Wikipedia squads page. If it 403s/blocks, STOP and ask Rafa
   to paste the tables — do not fabricate.
1. **Reconstruct editable source** from `dist/assets/index-BgiWlpiW.js`:
   - Create a Vite + React project (`package.json`, `vite.config.js`, `index.html` matching
     the current `dist/index.html`: Bebas Neue + Barlow Google Fonts, `#root`).
   - De-minify the bundle's APP code (everything after the React vendor chunk — app/data
     starts around the `=[{id:` / `confederation:` region) into readable source. You can
     keep the `(0,_jsx)(…)` runtime calls (import `jsx`,`jsxs` from `react/jsx-runtime`) —
     no need to convert to JSX syntax. Pull `v`, `y`, `ee`, `x`, `S`, `C`, `te`, `ne`, the
     city/food data, and components into sensible modules (e.g. `src/data/teams.js`,
     `src/data/players.js`, `src/data/ratings.js`, `src/App.jsx`, `src/main.jsx`).
   - Copy `dist/favicon.svg` and `dist/icons.svg` into `public/` (index.html references
     `/icons.svg`, `/favicon.svg`... note current index.html links `/vite.svg` for icon —
     keep behaviour identical).
   - `npm install && npm run build`, then **diff the produced site against the current
     `dist/` to confirm visual/behaviour parity BEFORE adding any new data.** Commit this
     "reconstruction reproduces current site" milestone.
2. **Scrape the 39 remaining squads** (all teams except the 9 exemplars) from the FIFA/
   Wikipedia source. Capture per player: position(GK/DF/MF/FW), name, club, shirt_number
   (null if blank), age, caps, captain flag. Honour quirks: **Canada = 25 players**
   (excluded anyway, it's an exemplar); squads of 23–26 valid, don't pad; ≥3 GK each.
3. **Ingest the 9 exemplar JSONs** + transform all 48 teams into the app model:
   - Map GK/DF/MF/FW → the app's verbose `pos` (see §2 mapping).
   - Generate stable player `id` slugs (e.g. `kebab(name)`, dedupe within team).
   - Write a one-line `desc` per player in the app's voice (rubric §3).
   - Add `ee` overrides: all exemplar players (use their JSON overall/stats), plus 1–4
     featured stars per other team (rubric §1/§2 scale; outfield 6 stats, GK uses the
     app's GK handling). Keep existing 449 players' `desc`/`ee` values unless improved.
   - Add `intro` + 3–5 `highlights` per team to `v` if the app surfaces them; otherwise map
     to the existing `style`/`verdict`/`strength`/`weakness` fields. (Check what the team
     view renders before choosing — keep the UI shape.)
4. **QA (brief §9) — must pass:** exactly 48 teams in the 12 groups of §7; every team 23–26
   players with ≥3 GK (PRINT a per-team count and eyeball it); no duplicate players per team;
   every player has pos + club; captains flagged; GK cards use GK format; ratings on the
   exemplar scale (no wild outliers); featured sparing (1–4/team); Search/Players/Teams/
   Groups tabs reflect new squads; countdown still targets the opener (Mexico v South Africa,
   11 June 2026).
5. **Build & ship:** `npm run build`; verify locally; commit the new `src/` AND regenerated
   `dist/`; produce `wc2026-netlify.zip` from `dist/` if Rafa wants the Drop fallback.
   Push to `claude/quirky-mendel-G4sgD`. Do NOT open a PR unless asked.
6. **Run summary** for Rafa: teams built, per-team counts, any team missing a confirmed
   squad / intro / highlights, any data gaps.

## 6. Open questions to confirm with Rafa if they arise
- Any team whose squad isn't yet confirmed on the source on build day → list it, don't guess.
- Whether to also generate `wc2026-netlify.zip` (Drop fallback) or rely on the GitHub→Netlify
  sync alone.
