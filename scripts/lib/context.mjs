// News & context layer (env-gated). Anticipates upsets by adjusting team
// strength for who's actually available and any crisis around the camp.
//
//   • Player availability (injuries + suspensions) ... API-Football  /injuries
//   • Crisis / narrative signal ...................... NewsData.io + RSS
//
// SAFE NO-OP: with no API_FOOTBALL_KEY this returns empty adjustments and the
// pipeline behaves exactly as before. Adjustments are only APPLIED to ratings
// when CONTEXT_ENABLED=1 — kept OFF until we've verified the data is real and
// complete (so we never silently ship predictions built on unverified data,
// and never claim "reads the news" before it truly does).

import { teams } from '../../src/data/teams.js';

const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY || '';
const NEWSDATA_KEY = process.env.NEWSDATA_KEY || '';
const WC_LEAGUE_ID = process.env.WC_LEAGUE_ID || '1'; // API-Football World Cup
const WC_SEASON = process.env.WC_SEASON || '2026';
const CONTEXT_ENABLED = process.env.CONTEXT_ENABLED === '1';

const log = (...a) => console.log('[context]', ...a);

// Elo points a team loses when a key player is unavailable, by position. Modest
// and capped — context nudges the model toward upsets, it doesn't overrule it.
const POS_WEIGHT = { Goalkeeper: 26, Defender: 12, Midfielder: 16, Attacker: 22 };
const DEFAULT_WEIGHT = 14;
const MAX_TEAM_PENALTY = 70;
const CRISIS_PENALTY = 12; // applied once if credible crisis signal found

const norm = (s) =>
  (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '');

// Map API-Football / news team names to our slugs.
const slugByNorm = new Map(teams.map((t) => [norm(t.name), t.id]));
const ALIASES = {
  unitedstates: 'usa', usa: 'usa', southkorea: 'south-korea',
  ivorycoast: 'cote-divoire', cotedivoire: 'cote-divoire',
  czechrepublic: 'czechia', czechia: 'czechia',
  bosniaandherzegovina: 'bosnia', bosniaherzegovina: 'bosnia',
  drcongo: 'dr-congo', democraticrepublicofthecongo: 'dr-congo',
  capeverde: 'cape-verde', turkiye: 'turkey', turkey: 'turkey',
  newzealand: 'new-zealand', saudiarabia: 'saudi-arabia', southafrica: 'south-africa',
};
function toSlug(name) {
  const n = norm(name);
  return ALIASES[n] || slugByNorm.get(n) || null;
}

async function afFetch(path) {
  const res = await fetch(`https://v3.football.api-sports.io/${path}`, {
    headers: { 'x-apisports-key': API_FOOTBALL_KEY },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`API-Football HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors && !Array.isArray(json.errors) && Object.keys(json.errors).length) {
    throw new Error(`API-Football errors: ${JSON.stringify(json.errors)}`);
  }
  return json.response || [];
}

// Log candidate World Cup league ids so we can confirm WC_LEAGUE_ID from a real run.
async function discoverLeague() {
  try {
    const r = await afFetch(`leagues?search=world%20cup`);
    const hits = r
      .filter((x) => /world cup/i.test(x.league?.name || ''))
      .map((x) => `${x.league.id}:${x.league.name} [${(x.seasons || []).map((s) => s.year).slice(-4).join(',')}]`);
    log(`league discovery (search "world cup"): ${hits.slice(0, 8).join(' | ') || 'none'}`);
  } catch (e) {
    log(`league discovery failed: ${e.message}`);
  }
}

// Injuries endpoint covers BOTH injuries and suspensions (tagged by reason).
async function fetchAvailability() {
  const rows = await afFetch(`injuries?league=${WC_LEAGUE_ID}&season=${WC_SEASON}`);
  const byTeam = {}; // slug -> { penalty, out:[{player,reason}], unmatched:Set }
  const unmatched = new Set();
  const seen = new Set(); // dedupe player per team

  for (const row of rows) {
    const teamName = row.team?.name;
    const slug = toSlug(teamName);
    if (!slug) { if (teamName) unmatched.add(teamName); continue; }
    const key = `${slug}:${row.player?.id || row.player?.name}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const pos = row.player?.position || '';
    const w = POS_WEIGHT[pos] || DEFAULT_WEIGHT;
    (byTeam[slug] ||= { penalty: 0, out: [] });
    byTeam[slug].penalty = Math.min(MAX_TEAM_PENALTY, byTeam[slug].penalty + w);
    byTeam[slug].out.push({ player: row.player?.name, reason: row.reason || row.type });
  }
  return { byTeam, rows: rows.length, unmatched: [...unmatched] };
}

// Light crisis signal: a few broad NewsData queries; flag teams co-mentioned
// with negative terms. Fuzzy by design — only a small, capped nudge.
async function fetchCrisis() {
  if (!NEWSDATA_KEY) return { byTeam: {}, results: 0 };
  const NEG = /(crisis|sacked|resign|turmoil|revolt|bust-?up|strike|chaos|scandal|axed)/i;
  const byTeam = {};
  let results = 0;
  try {
    const url = `https://newsdata.io/api/1/news?apikey=${NEWSDATA_KEY}&category=sports&language=en&q=${encodeURIComponent('World Cup squad crisis OR coach sacked OR suspended')}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const json = await res.json();
    const articles = json.results || [];
    results = articles.length;
    for (const a of articles) {
      const text = `${a.title || ''} ${a.description || ''}`;
      if (!NEG.test(text)) continue;
      for (const t of teams) {
        if (new RegExp(`\\b${t.name}\\b`, 'i').test(text)) (byTeam[t.id] ||= CRISIS_PENALTY);
      }
    }
  } catch (e) {
    log(`newsdata fetch failed: ${e.message}`);
  }
  return { byTeam, results };
}

/**
 * Returns { enabled, applied, adjustments:{slug:eloPenalty}, coverage }.
 * Never throws — on any error it degrades to a no-op.
 */
export async function fetchContext() {
  if (!API_FOOTBALL_KEY) {
    log('no API_FOOTBALL_KEY — context layer inactive (no-op)');
    return { enabled: false, applied: false, adjustments: {}, coverage: null };
  }
  try {
    await discoverLeague();
    const avail = await fetchAvailability();
    const crisis = await fetchCrisis();

    const adjustments = {};
    for (const [slug, info] of Object.entries(avail.byTeam)) adjustments[slug] = info.penalty;
    for (const [slug, pen] of Object.entries(crisis.byTeam)) adjustments[slug] = (adjustments[slug] || 0) + pen;

    // --- coverage diagnostics (this is what we read from the run logs) ---
    const teamsHit = Object.keys(avail.byTeam).length;
    log(`API-Football injuries rows: ${avail.rows} | teams matched: ${teamsHit}/48`);
    if (avail.unmatched.length) log(`UNMATCHED team names (add aliases): ${avail.unmatched.join(', ')}`);
    const sample = Object.entries(avail.byTeam).slice(0, 5)
      .map(([s, i]) => `${s}(-${i.penalty}: ${i.out.slice(0, 3).map((o) => `${o.player}/${o.reason}`).join(', ')})`);
    if (sample.length) log(`sample availability: ${sample.join(' | ')}`);
    log(`NewsData results: ${crisis.results} | crisis-flagged teams: ${Object.keys(crisis.byTeam).join(', ') || 'none'}`);
    log(`CONTEXT_ENABLED=${CONTEXT_ENABLED ? '1 (adjustments WILL apply)' : '0 (diagnostic only — NOT applied)'}`);

    return {
      enabled: true,
      applied: CONTEXT_ENABLED,
      adjustments,
      coverage: { injuryRows: avail.rows, teamsHit, unmatched: avail.unmatched, crisisResults: crisis.results },
    };
  } catch (e) {
    log(`context layer error — degrading to no-op: ${e.message}`);
    return { enabled: true, applied: false, adjustments: {}, coverage: null };
  }
}
