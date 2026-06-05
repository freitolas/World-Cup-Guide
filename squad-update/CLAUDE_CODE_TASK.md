# Claude Code Task — WC2026 Fan Guide: Build all 48 official squads

**This is the definitive instruction. It supersedes the earlier draft brief.**
Date: 3 June 2026. The FIFA squads are confirmed (announced 2 June 2026).

---

## 0. For Rafa (plain language)

This tells Claude Code to finish the squad update for all 48 teams in one run, using
the format already approved. Claude (chat) has already built 9 teams by hand as the
quality standard — England plus Groups A and B. Claude Code reuses those as-is and
builds the other 39 the same way, then updates the app and packages it for Netlify Drop.

If Claude Code says it can't fetch the data source, just paste the squad table to it
(or tell Rafa) — don't let it invent squads.

## 1. Goal

Update the React/Vite app (`src/App.jsx`) so **every one of the 48 teams** has its full
official 26-man (23–26) squad, each player as a card matching the exemplars, plus a team
intro and highlights. Keep the existing look, navigation, favourite-team and all features.

## 2. Source of truth (accuracy is the hard rule)

- **Official facts** (position, name, club, age, caps, captain, shirt number) come ONLY
  from the FIFA-published squad lists, read via the FIFA-sourced transcription at
  `https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_squads`
  ("the position listed for each player is per the official squad list published by FIFA").
  Treat fifa.com as the ultimate authority.
- **Fetch that page and parse the per-team tables.** If you cannot fetch it, STOP and ask
  Rafa to paste the table — do **not** invent or guess squad membership.
- Some teams' shirt numbers are still blank in the table → store `shirt_number: null`.
- Known quirk: **Canada = 25 players** (Marcelo Flores withdrew injured; replacement not
  yet named). Squads of 23–25 are valid; don't pad to 26.

## 3. Already done — reuse verbatim, do NOT rebuild

Ingest these exemplar files as-is (9 teams):
- `squads_data_England_SAMPLE.json` — England (Group L)
- `squads_data_GroupA.json` — Mexico, South Africa, South Korea, Czechia
- `squads_data_GroupB.json` — Canada, Bosnia and Herzegovina, Qatar, Switzerland

Build the remaining **39 teams** to the identical schema and quality.

## 4. Data schema

Per `squads_data_TEMPLATE.json` and the exemplars: each player splits into
`official` (FIFA facts) and `app` (editorial: overall, six stats, bio, featured).
GK `stats` = null. Produce one combined master `squads_data.json` (all 48 teams,
grouped A–L) as the build artifact.

## 5. Ratings (the editorial layer)

Generate `overall`, six `stats`, `bio`, `featured` per **`RATING_RUBRIC.md`**, anchored
to the exemplars so the whole tournament sits on one consistent scale. These are the
app's own estimates, never labelled as FIFA data.

## 6. Intros & highlights

Per team: a 2–4 sentence `intro` and 3–5 `highlights` bullets (key player, tactical
identity, a storyline). Paraphrase from reputable previews — never copy text verbatim.
If no preview info is available for a team, write a concise factual intro from the squad
itself rather than leaving it blank, and list that team in the run summary.

## 7. The 48 teams / 12 groups — reconcile FIRST

Make the app contain exactly these, in these groups, before loading players:

A: Mexico, South Africa, South Korea, Czechia
B: Canada, Bosnia and Herzegovina, Qatar, Switzerland
C: Brazil, Morocco, Haiti, Scotland
D: USA, Paraguay, Australia, Türkiye
E: Germany, Curaçao, Ivory Coast, Ecuador
F: Netherlands, Japan, Sweden, Tunisia
G: Belgium, Egypt, Iran, New Zealand
H: Spain, Cape Verde, Saudi Arabia, Uruguay
I: France, Senegal, Iraq, Norway
J: Argentina, Algeria, Austria, Jordan
K: Portugal, DR Congo, Uzbekistan, Colombia
L: England, Croatia, Ghana, Panama

Report any add/remove/regroup to Rafa, then fix so it matches exactly.

## 8. Merge into the app

Replace each team's roster with the new squad data. The app previously held only ~240
"star" players; it should now hold full squads (~1,250 players). Keep the existing card
UI, theme (dark navy/gold), tabs, search, favourite-team localStorage and back-button.

## 9. QA checklist (must pass before delivering)

- [ ] Exactly the 48 teams in the 12 groups in §7 — no more, no fewer.
- [ ] Every team 23–26 players, ≥3 GK. **Print a per-team count and eyeball it** (a
      player was dropped once during hand-building and only the count-check caught it).
- [ ] No duplicate players within a team; every player has position + club.
- [ ] Captains flagged where the source marks them.
- [ ] GK cards use the app's GK format (stats null in data).
- [ ] Ratings sit on the exemplar scale (no inflated/deflated outliers).
- [ ] Featured flags are sparing (1–4 per team).
- [ ] Search / Players / Teams / Groups tabs reflect the new squads.
- [ ] Countdown still targets the opener (Mexico v South Africa, 11 June 2026).
- [ ] `npm run build` passes; produce `wc2026-netlify.zip` from `dist/`.
- [ ] Run summary: teams built, any team missing intro/highlights, any data gaps.

## 10. Deploy
Rafa uploads the unzipped `dist/` folder to Netlify Drop from their phone, as before.
