# Rating Rubric — WC2026 App player cards

This documents exactly how the editorial ratings in the exemplar files (England,
Group A, Group B) were produced, so the remaining teams are rated on the **same scale**.

**These ratings are the app's own estimates — NOT FIFA data.** Official facts
(name, position, club, age, caps, captain, shirt number) come only from the FIFA
source. Ratings/bios/featured are editorial and must never be presented as FIFA's.

## 1. Overall rating bands (0–99, FIFA-card style)

- **86–90** — World-class stars. (e.g. Kane 89, Bellingham 88, Saka 87, Son 86, Davies 85, Kim Min-jae 85, Xhaka 84, Akanji 84, Kobel 84.) Reserve for genuine elite.
- **80–85** — Very good international starters / standout players. (Schick 82, J. David 83, Lee Kang-in 83, Soucek 81, D. Zakaria 81, Edson Alvarez 81, Embolo 80, Dzeko 80, Almoez Ali 79.)
- **76–79** — Solid international regulars and first-XI players from mid-tier nations.
- **72–75** — Squad rotation and role players at a decent club level.
- **68–71** — Fringe squad members, uncapped/very young, or lower-division players.

Anchor each new player by comparing to similar players already rated in the exemplars.
Don't inflate minnows or deflate big nations; keep the distribution realistic.

## 2. Six stats (pac, sho, pas, dri, def, phy), 0–99

Goalkeepers: **stats = null** (the app renders GK cards in its own format).

Outfield tendencies (then scale the magnitudes to the player's overall):
- **Centre-back:** high DEF/PHY, moderate PAC/PAS, low SHO.
- **Full-back / wing-back:** high PAC, good DRI/PAS, moderate DEF, low SHO.
- **Defensive mid:** high DEF/PHY/PAS, moderate everything else.
- **Central mid:** balanced, PAS-led.
- **Attacking mid / winger:** high PAC/DRI, good SHO/PAS, low DEF.
- **Striker:** high SHO/PHY, PAC varies by type, low DEF.

Club tier and caps nudge values: top-5-league regulars and high-cap players trend up;
domestic/lower-league and uncapped trend down.

## 3. Bio
One short, punchy, evaluative sentence in the app's voice (see exemplars). No fluff.

## 4. Featured flag
`true` only for genuine stars / household names / each team's clear key player —
typically **1–4 per team**, never more.

## 5. Fields that are copied verbatim from FIFA (never invented)
position, name, club, age, caps, captain, shirt_number (use null if the FIFA table
leaves it blank). A player is in a squad ONLY if the FIFA source lists them.
