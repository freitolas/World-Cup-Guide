// Build an Elo rating for every one of our 48 finalists.
//
//   1. Use the vendored model's calibrated rating where it has one (39 teams).
//   2. Fill the gaps (9 teams the model never rated) by regressing Elo against
//      FIFA ranking across the teams we do have, then predicting from rank.
//   3. Nudge ratings forward with actual 2026 results as they're played, so the
//      numbers stay current through the tournament.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { teams } from '../../src/data/teams.js';
import { toModelSlug } from './teamMap.mjs';
import { expectedScore } from '../../vendor/wc-model/elo.mjs';

const HOSTS = new Set(['mexico', 'usa', 'canada']);
const HOME_ADV = 75;
const K_WC = 55; // World Cup importance (matches the vendored model's calibration)

const calibrated = JSON.parse(
  readFileSync(fileURLToPath(new URL('../../vendor/wc-model/data/elo-calibrated.json', import.meta.url)), 'utf8'),
).ratings;

// Least-squares fit of elo = a + b*rank over teams we have both for.
function fitRankToElo(pairs) {
  const n = pairs.length;
  const sx = pairs.reduce((s, p) => s + p.rank, 0);
  const sy = pairs.reduce((s, p) => s + p.elo, 0);
  const sxx = pairs.reduce((s, p) => s + p.rank * p.rank, 0);
  const sxy = pairs.reduce((s, p) => s + p.rank * p.elo, 0);
  const b = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  const a = (sy - b * sx) / n;
  return (rank) => Math.round(a + b * rank);
}

/**
 * @param {Array<{homeSlug,awaySlug,hg,ag,date}>} playedResults  2026 results, mapped to our slugs
 * @returns {{ratings: Record<string,number>, gapFilled: string[]}}
 */
export function buildRatings(playedResults = []) {
  const known = [];
  const gapFilled = [];

  for (const t of teams) {
    const r = calibrated[toModelSlug(t.id)];
    if (r != null) known.push({ slug: t.id, rank: t.rank, elo: r });
  }
  const predict = fitRankToElo(known);

  const ratings = {};
  for (const t of teams) {
    const r = calibrated[toModelSlug(t.id)];
    if (r != null) {
      ratings[t.id] = r;
    } else {
      ratings[t.id] = predict(t.rank);
      gapFilled.push(t.id);
    }
  }

  // Nudge forward with played 2026 results (chronological Elo updates).
  const ordered = [...playedResults]
    .filter((m) => m.homeSlug && m.awaySlug && m.hg != null && m.ag != null)
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));

  for (const m of ordered) {
    if (ratings[m.homeSlug] == null || ratings[m.awaySlug] == null) continue;
    const hb = HOSTS.has(m.homeSlug) ? HOME_ADV : 0;
    const exp = expectedScore(ratings[m.homeSlug], ratings[m.awaySlug], hb);
    const actual = m.hg > m.ag ? 1 : m.hg < m.ag ? 0 : 0.5;
    const gd = Math.abs(m.hg - m.ag);
    const mult = gd <= 1 ? 1 : gd === 2 ? 1.5 : (11 + gd) / 8;
    const delta = K_WC * mult * (actual - exp);
    ratings[m.homeSlug] = Math.round(ratings[m.homeSlug] + delta);
    ratings[m.awaySlug] = Math.round(ratings[m.awaySlug] - delta);
  }

  return { ratings, gapFilled };
}

export { HOSTS, HOME_ADV };
