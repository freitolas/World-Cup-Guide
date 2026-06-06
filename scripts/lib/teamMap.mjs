// Reconciliation between three naming worlds:
//   - openfootball display names  ("Bosnia & Herzegovina", "Ivory Coast")
//   - our slugs                   ("bosnia",                "cote-divoire")
//   - the vendored model's slugs  ("bosnia-and-herzegovina","ivory-coast")
//
// The base name->slug map is derived from src/data/teams.js so it stays in sync
// with our own data; only the genuinely different spellings are hard-coded.

import { teams } from '../../src/data/teams.js';

const slugSet = new Set(teams.map((t) => t.id));

// Auto map: exact team name -> slug, plus a normalized fallback.
const byName = new Map();
for (const t of teams) byName.set(t.name.toLowerCase(), t.id);

// openfootball spellings that don't lowercase cleanly to our slug.
const OPENFOOTBALL_ALIASES = {
  'bosnia & herzegovina': 'bosnia',
  'cape verde': 'cape-verde',
  curaçao: 'curacao',
  curacao: 'curacao',
  'czech republic': 'czechia',
  'dr congo': 'dr-congo',
  'ivory coast': 'cote-divoire',
  "côte d'ivoire": 'cote-divoire',
  'cote d’ivoire': 'cote-divoire',
  'new zealand': 'new-zealand',
  'saudi arabia': 'saudi-arabia',
  'south africa': 'south-africa',
  'south korea': 'south-korea',
  'korea republic': 'south-korea',
  usa: 'usa',
  'united states': 'usa',
  türkiye: 'turkey',
  turkiye: 'turkey',
  turkey: 'turkey',
};

// Our slug -> the vendored model's rating key, where they differ.
const MODEL_SLUG = {
  'cote-divoire': 'ivory-coast',
  czechia: 'czech-republic',
  bosnia: 'bosnia-and-herzegovina',
};

// openfootball uses placeholders for unresolved knockout slots:
//   group positions  -> "1A", "2B"
//   best-third combos -> "3A/B/C/D/F"
//   winners/losers    -> "W73", "L101"
const PLACEHOLDER = /^(\d+[A-L]|\d+[A-L/]+|[WL]\d+)$/;

export function isPlaceholder(name) {
  return PLACEHOLDER.test(String(name).trim());
}

/** openfootball display name -> our slug, or null if it can't be mapped. */
export function nameToSlug(name) {
  if (!name) return null;
  const raw = String(name).trim();
  if (isPlaceholder(raw)) return null;
  const key = raw.toLowerCase();
  const slug = OPENFOOTBALL_ALIASES[key] || byName.get(key) || key.replace(/\s+/g, '-');
  return slugSet.has(slug) ? slug : null;
}

/** our slug -> the vendored model's rating key. */
export function toModelSlug(slug) {
  return MODEL_SLUG[slug] || slug;
}

/** Names that are real teams but we failed to map — a signal worth surfacing. */
export function unmapped(name) {
  return !isPlaceholder(name) && nameToSlug(name) === null;
}
