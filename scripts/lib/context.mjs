// News & context layer (env-gated). Anticipates upsets by adjusting team
// strength for who's available and any crisis around the camp.
//
// Verified coverage (2026-06-07 live test):
//   • API-Football /injuries for the World Cup returns NOTHING (it tracks club
//     injuries, not national-team ones) — so injuries come from NEWS, hedged.
//   • API-Football /fixtures/events DOES carry cards for WC matches → we derive
//     SUSPENSIONS from card accumulation (reliable, but only from matchday 2).
//   • NewsData.io is reachable and commercial-OK → crisis + (hedged) injuries.
//
// SAFE NO-OP without keys. Adjustments only APPLIED when CONTEXT_ENABLED=1 —
// kept OFF until validated against real match/news data during the tournament.
// Signals are honest: suspensions are high-confidence; news injuries/crisis are
// low-confidence and weighted lightly so they nudge, never dominate.

import { teams } from '../../src/data/teams.js';

const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY || '';
const NEWSDATA_KEY = process.env.NEWSDATA_KEY || '';
const WC_LEAGUE_ID = process.env.WC_LEAGUE_ID || '1'; // confirmed: World Cup
const WC_SEASON = process.env.WC_SEASON || '2026';
const CONTEXT_ENABLED = process.env.CONTEXT_ENABLED === '1';

const log = (...a) => console.log('[context]', ...a);

// Elo points removed from a team per signal. Suspensions are real, confirmed
// absences (higher); news-based injuries are uncertain (low); crisis is a small
// mood tax. Capped so a depleted team can't be nuked below plausibility.
const SUSPENSION_WEIGHT = 18;
const NEWS_INJURY_WEIGHT = 8; // hedged — news is noisy
const CRISIS_PENALTY = 12;
const MAX_TEAM_PENALTY = 70;

const norm = (s) =>
  (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '');
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
const toSlug = (name) => {
  const n = norm(name);
  return ALIASES[n] || slugByNorm.get(n) || null;
};

async function afFetch(path) {
  const res = await fetch(`https://v3.football.api-sports.io/${path}`, {
    headers: { 'x-apisports-key': API_FOOTBALL_KEY },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`API-Football HTTP ${res.status}`);
  const json = await res.json();
  return json.response || [];
}

async function discoverLeague() {
  try {
    const r = await afFetch(`leagues?search=world%20cup`);
    const hit = r.find((x) => /^world cup$/i.test(x.league?.name || ''));
    if (hit) log(`league confirmed: id=${hit.league.id} "${hit.league.name}"`);
  } catch (e) {
    log(`league discovery failed: ${e.message}`);
  }
}

// SUSPENSIONS from card accumulation across played WC matches. Heuristic (FIFA
// rules are intricate — yellows reset after the QFs, a 2nd yellow or red = a
// one-match ban): a player is treated as banned for their team's NEXT match if,
// in the MOST RECENT match they featured in, they were sent off (red / second
// yellow) or reached an even yellow tally (2nd, 4th…). Refine once real card
// data exists (matchday 2+). Returns { byTeam:{slug:{penalty,out[]}}, ... }.
async function fetchSuspensions() {
  const fixtures = await afFetch(`fixtures?league=${WC_LEAGUE_ID}&season=${WC_SEASON}&status=FT`);
  const finished = fixtures
    .map((f) => ({ id: f.fixture?.id, date: f.fixture?.date }))
    .filter((f) => f.id)
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));

  const yellows = {}; // pid -> { count, lastDate, team, name }
  const sentOff = {}; // pid -> { lastDate, team, name }
  let cards = 0;

  for (const fx of finished) {
    let events = [];
    try { events = await afFetch(`fixtures/events?fixture=${fx.id}`); } catch { continue; }
    for (const ev of events) {
      if (ev.type !== 'Card') continue;
      cards++;
      const pid = ev.player?.id ?? `${ev.team?.name}:${ev.player?.name}`;
      const meta = { team: ev.team?.name, name: ev.player?.name, lastDate: fx.date };
      if (/red/i.test(ev.detail) || /second yellow/i.test(ev.detail)) {
        sentOff[pid] = meta;
      } else if (/yellow/i.test(ev.detail)) {
        yellows[pid] = { count: (yellows[pid]?.count || 0) + 1, ...meta };
      }
    }
  }

  const byTeam = {};
  const add = (meta, why) => {
    const slug = toSlug(meta.team);
    if (!slug) return;
    (byTeam[slug] ||= { penalty: 0, out: [] });
    byTeam[slug].penalty = Math.min(MAX_TEAM_PENALTY, byTeam[slug].penalty + SUSPENSION_WEIGHT);
    byTeam[slug].out.push(`${meta.name} (${why})`);
  };
  for (const m of Object.values(sentOff)) add(m, 'sent off');
  for (const y of Object.values(yellows)) if (y.count % 2 === 0 && y.count > 0) add(y, `${y.count} yellows`);

  return { byTeam, finished: finished.length, cards };
}

// NEWS signals (NewsData.io): injuries (hedged, low weight) and crisis. A small
// set of broad queries; team is flagged when co-mentioned with a signal keyword.
async function fetchNews() {
  const injuryTeams = {};
  const crisisTeams = {};
  if (!NEWSDATA_KEY) return { injuryTeams, crisisTeams, results: 0 };

  const INJURY = /(injur|ruled out|sidelined|in doubt|strain|knock|withdraw|out of the (world cup|tournament))/i;
  const CRISIS = /(crisis|sacked|resign|turmoil|revolt|bust-?up|player strike|chaos|scandal|axed|feud|mutiny)/i;
  const queries = [
    'World Cup injury OR ruled out OR doubt',
    'World Cup coach sacked OR crisis OR turmoil',
    'national team suspended OR withdrawal squad',
  ];

  const seen = new Set();
  let results = 0;
  for (const q of queries) {
    try {
      const url = `https://newsdata.io/api/1/news?apikey=${NEWSDATA_KEY}&language=en&category=sports&q=${encodeURIComponent(q)}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      const json = await res.json();
      for (const a of json.results || []) {
        if (seen.has(a.link)) continue;
        seen.add(a.link);
        results++;
        const text = `${a.title || ''} ${a.description || ''}`;
        const inj = INJURY.test(text);
        const cri = CRISIS.test(text);
        if (!inj && !cri) continue;
        for (const t of teams) {
          if (!new RegExp(`\\b${t.name}\\b`, 'i').test(text)) continue;
          if (inj) injuryTeams[t.id] = (injuryTeams[t.id] || 0) + 1;
          if (cri) crisisTeams[t.id] = true;
        }
      }
    } catch (e) {
      log(`newsdata query failed (${q}): ${e.message}`);
    }
  }
  return { injuryTeams, crisisTeams, results };
}

/**
 * Returns { enabled, applied, adjustments:{slug:eloPenalty}, coverage }.
 * Never throws — degrades to a no-op on any error.
 */
export async function fetchContext() {
  if (!API_FOOTBALL_KEY && !NEWSDATA_KEY) {
    log('no keys — context layer inactive (no-op)');
    return { enabled: false, applied: false, adjustments: {}, coverage: null };
  }
  try {
    const adjustments = {};
    const bump = (slug, n) => { if (slug) adjustments[slug] = Math.min(MAX_TEAM_PENALTY, (adjustments[slug] || 0) + n); };

    let susp = { byTeam: {}, finished: 0, cards: 0 };
    if (API_FOOTBALL_KEY) {
      await discoverLeague();
      try { susp = await fetchSuspensions(); } catch (e) { log(`suspensions failed: ${e.message}`); }
      for (const [slug, info] of Object.entries(susp.byTeam)) bump(slug, info.penalty);
    }

    const news = await fetchNews();
    for (const slug of Object.keys(news.injuryTeams)) bump(slug, NEWS_INJURY_WEIGHT);
    for (const slug of Object.keys(news.crisisTeams)) bump(slug, CRISIS_PENALTY);

    // --- coverage diagnostics (read from run logs) ---
    log(`suspensions: ${Object.keys(susp.byTeam).length} team(s) from ${susp.finished} finished match(es), ${susp.cards} card(s)`);
    if (Object.keys(susp.byTeam).length)
      log(`  ${Object.entries(susp.byTeam).map(([s, i]) => `${s}(-${i.penalty}: ${i.out.join(', ')})`).join(' | ')}`);
    log(`news: ${news.results} article(s) | injury-flagged: ${Object.keys(news.injuryTeams).join(', ') || 'none'} | crisis-flagged: ${Object.keys(news.crisisTeams).join(', ') || 'none'}`);
    log(`CONTEXT_ENABLED=${CONTEXT_ENABLED ? '1 (adjustments WILL apply)' : '0 (diagnostic only — NOT applied)'}`);

    return {
      enabled: true,
      applied: CONTEXT_ENABLED,
      adjustments,
      coverage: { suspensions: Object.keys(susp.byTeam).length, finished: susp.finished, cards: susp.cards, newsResults: news.results },
    };
  } catch (e) {
    log(`context layer error — degrading to no-op: ${e.message}`);
    return { enabled: true, applied: false, adjustments: {}, coverage: null };
  }
}
