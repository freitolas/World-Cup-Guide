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
import { players } from '../../src/data/players.js';
import { featured } from '../../src/data/featured.js';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY || '';
const NEWSDATA_KEY = process.env.NEWSDATA_KEY || '';
const WC_LEAGUE_ID = process.env.WC_LEAGUE_ID || '1'; // confirmed: World Cup
const WC_SEASON = process.env.WC_SEASON || '2026';
const CONTEXT_ENABLED = process.env.CONTEXT_ENABLED === '1';

// News signals (NewsData) are VOLATILE — each query returns only the latest ~10
// articles and that set churns, so a real injury story can be present one run and
// gone the next. We persist detected NEWS signals in a small cache and keep them
// "live" for this many hours, so a transient article still shapes a pick that
// freezes hours later (and the preview + the lock stay consistent). Suspensions /
// structured injuries come from API-Football and are NOT cached (they're stable).
const NEWS_SIGNAL_TTL_MS = Number(process.env.NEWS_SIGNAL_TTL_HOURS || 36) * 3.6e6;
const SIGNAL_CACHE_FILE = fileURLToPath(new URL('../../src/data/news-signals.json', import.meta.url));
// A team is only flagged from news when the article is actually about football —
// cuts cross-sport false positives ("England" injuries in cricket/rugby, etc.).
const FOOTBALL_CTX = /(football|soccer|world cup|fifa|qualifier|friendly|national team|head coach|manager|striker|forward|midfield|defend|goalkeep|squad)/i;
const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const log = (...a) => console.log('[context]', ...a);

// Elo points removed from a team per signal. Suspensions are real, confirmed
// absences (higher); news-based injuries are uncertain (low); crisis is a small
// mood tax. Capped so a depleted team can't be nuked below plausibility.
const SUSPENSION_WEIGHT = 18;
const STRUCT_INJURY_WEIGHT = 16; // structured (per-fixture) injury — higher confidence than news
const NEWS_INJURY_WEIGHT = 8; // hedged — news is noisy
const CRISIS_PENALTY = 12;
const MAX_TEAM_PENALTY = 120; // raised so a depleted spine (2+ key absences) can stack into a real collapse

// Player importance multiplier — losing a star (Mbappé) hurts far more than a
// squad player. Featured elite ×3, curated/notable squad ×2, anonymous ×1.
const FEATURED = new Set(featured);
const normName = (s) =>
  (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
const tierFull = new Map();
const tierLast = new Map();
const starsByTeam = {};
for (const p of players) {
  const tier = FEATURED.has(p.id) ? 3 : (p.desc ? 2 : 1);
  const nm = normName(p.name);
  tierFull.set(nm, Math.max(tierFull.get(nm) || 0, tier));
  const last = nm.split(' ').pop();
  if (last && last.length >= 4) tierLast.set(last, Math.max(tierLast.get(last) || 0, tier));
  if (FEATURED.has(p.id) && last) (starsByTeam[p.team] ||= []).push(last);
}
const importance = (name) => {
  const nm = normName(name);
  if (tierFull.has(nm)) return tierFull.get(nm);
  const last = nm.split(' ').pop();
  return (last && tierLast.get(last)) || 1;
};

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
    const mult = importance(meta.name);
    (byTeam[slug] ||= { penalty: 0, out: [] });
    byTeam[slug].penalty = Math.min(MAX_TEAM_PENALTY, byTeam[slug].penalty + SUSPENSION_WEIGHT * mult);
    byTeam[slug].out.push(`${meta.name} (${why}${mult > 1 ? `, ×${mult}` : ''})`);
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
        if (!FOOTBALL_CTX.test(text)) continue; // drop cross-sport / off-topic articles
        const nt = ` ${normName(text)} `;
        for (const t of teams) {
          if (!new RegExp(`\\b${reEsc(t.name)}\\b`, 'i').test(text)) continue;
          if (inj) {
            // tier 3 if one of this team's featured stars is named in the article
            const star = (starsByTeam[t.id] || []).some((last) => nt.includes(` ${last} `));
            injuryTeams[t.id] = Math.max(injuryTeams[t.id] || 0, star ? 3 : 1);
          }
          if (cri) crisisTeams[t.id] = true;
        }
      }
    } catch (e) {
      log(`newsdata query failed (${q}): ${e.message}`);
    }
  }
  return { injuryTeams, crisisTeams, results };
}

// ── rolling news-signal cache ────────────────────────────────────────────────
export function loadSignalCache(path = SIGNAL_CACHE_FILE) {
  try {
    if (existsSync(path)) {
      const c = JSON.parse(readFileSync(path, 'utf8'));
      return { injury: c.injury || {}, crisis: c.crisis || {} };
    }
  } catch (e) { log(`signal cache unreadable — starting fresh: ${e.message}`); }
  return { injury: {}, crisis: {} };
}

// Write the cache. ONLY the pipeline (update.mjs) and the preview persist it; the
// runner is ephemeral so persistence is via the committed file.
export function persistSignalCache(cache, path = SIGNAL_CACHE_FILE) {
  try {
    writeFileSync(path, JSON.stringify({ updated: new Date().toISOString(), injury: cache.injury || {}, crisis: cache.crisis || {} }, null, 2) + '\n');
    return true;
  } catch (e) { log(`signal cache write failed: ${e.message}`); return false; }
}

// Fold this run's fresh detections into the cache, prune anything older than the
// TTL, and return the EFFECTIVE signals still live (fresh ∪ remembered). Mutates
// `cache` in place; `freshInjury`/`freshCrisis` mark what was seen THIS run.
// Exported for tests.
export function mergeSignalCache(cache, fresh, now) {
  const iso = new Date(now).toISOString();
  const freshInjury = new Set(Object.keys(fresh.injuryTeams));
  const freshCrisis = new Set(Object.keys(fresh.crisisTeams));
  for (const [slug, tier] of Object.entries(fresh.injuryTeams)) {
    const e = cache.injury[slug] || {};
    cache.injury[slug] = { tier: Math.max(e.tier || 0, tier), firstSeen: e.firstSeen || iso, lastSeen: iso };
  }
  for (const slug of freshCrisis) {
    const e = cache.crisis[slug] || {};
    cache.crisis[slug] = { firstSeen: e.firstSeen || iso, lastSeen: iso };
  }
  const live = (e) => e && e.lastSeen && (now - Date.parse(e.lastSeen)) <= NEWS_SIGNAL_TTL_MS;
  const injury = {}, crisis = {};
  for (const [slug, e] of Object.entries(cache.injury)) { if (live(e)) injury[slug] = e.tier || 1; else delete cache.injury[slug]; }
  for (const [slug, e] of Object.entries(cache.crisis)) { if (live(e)) crisis[slug] = true; else delete cache.crisis[slug]; }
  return { injury, crisis, freshInjury, freshCrisis };
}

/**
 * Returns { enabled, applied, adjustments:{slug:eloPenalty}, coverage }.
 * Never throws — degrades to a no-op on any error.
 */
export async function fetchContext() {
  if (!API_FOOTBALL_KEY && !NEWSDATA_KEY) {
    log('no keys — context layer inactive (no-op)');
    return { enabled: false, applied: false, adjustments: {}, reasons: {}, coverage: null };
  }
  try {
    const adjustments = {};
    const reasons = {}; // slug -> [human-readable signal strings], surfaced for lock notifications
    const bump = (slug, n) => { if (slug) adjustments[slug] = Math.min(MAX_TEAM_PENALTY, (adjustments[slug] || 0) + n); };
    const addReason = (slug, s) => { if (slug && s) (reasons[slug] ||= []).push(s); };

    let susp = { byTeam: {}, finished: 0, cards: 0 };
    if (API_FOOTBALL_KEY) {
      await discoverLeague();
      try { susp = await fetchSuspensions(); } catch (e) { log(`suspensions failed: ${e.message}`); }
      for (const [slug, info] of Object.entries(susp.byTeam)) {
        bump(slug, info.penalty);
        for (const o of info.out) addReason(slug, `suspended — ${o}`);
      }
    }

    // Per-fixture injuries probe — national-team availability tends to appear on
    // the fixture endpoint near matchday (the season-wide query returned 0).
    let probe = { fixtures: 0, rows: 0 };
    if (API_FOOTBALL_KEY) {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const to = new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10);
        const upcoming = await afFetch(`fixtures?league=${WC_LEAGUE_ID}&season=${WC_SEASON}&from=${today}&to=${to}`);
        for (const f of upcoming.slice(0, 8)) {
          const inj = await afFetch(`injuries?fixture=${f.fixture?.id}`);
          probe.fixtures++;
          probe.rows += inj.length;
          for (const row of inj) {
            const slug = toSlug(row.team?.name);
            bump(slug, STRUCT_INJURY_WEIGHT * importance(row.player?.name));
            addReason(slug, `injury — ${row.player?.name || 'unnamed player'}${row.player?.reason ? ` (${row.player.reason})` : ''}`);
          }
        }
      } catch (e) {
        log(`injuries probe failed: ${e.message}`);
      }
      log(`per-fixture injuries probe: ${probe.fixtures} upcoming fixture(s), ${probe.rows} injury row(s)`);
    }

    // News signals, smoothed through the rolling TTL cache (fresh ∪ remembered).
    const now = Date.now();
    const news = await fetchNews();
    const signalCache = loadSignalCache();
    const eff = mergeSignalCache(signalCache, news, now);
    for (const [slug, tier] of Object.entries(eff.injury)) {
      bump(slug, NEWS_INJURY_WEIGHT * tier);
      const recent = eff.freshInjury.has(slug) ? '' : ' (recent)';
      addReason(slug, (tier >= 3 ? 'injury reported in news (a key player named)' : 'injury reported in news') + recent);
    }
    for (const slug of Object.keys(eff.crisis)) {
      bump(slug, CRISIS_PENALTY);
      addReason(slug, 'camp crisis reported in news' + (eff.freshCrisis.has(slug) ? '' : ' (recent)'));
    }

    // --- coverage diagnostics (read from run logs) ---
    log(`suspensions: ${Object.keys(susp.byTeam).length} team(s) from ${susp.finished} finished match(es), ${susp.cards} card(s)`);
    if (Object.keys(susp.byTeam).length)
      log(`  ${Object.entries(susp.byTeam).map(([s, i]) => `${s}(-${i.penalty}: ${i.out.join(', ')})`).join(' | ')}`);
    log(`news: ${news.results} article(s) | fresh injury: ${[...eff.freshInjury].join(', ') || 'none'} | fresh crisis: ${[...eff.freshCrisis].join(', ') || 'none'}`);
    log(`news EFFECTIVE (incl. cached ≤${NEWS_SIGNAL_TTL_MS / 3.6e6}h): injury: ${Object.keys(eff.injury).join(', ') || 'none'} | crisis: ${Object.keys(eff.crisis).join(', ') || 'none'}`);
    log(`CONTEXT_ENABLED=${CONTEXT_ENABLED ? '1 (adjustments WILL apply)' : '0 (diagnostic only — NOT applied)'}`);

    return {
      signalCache,
      enabled: true,
      applied: CONTEXT_ENABLED,
      adjustments,
      reasons,
      coverage: { suspensions: Object.keys(susp.byTeam).length, finished: susp.finished, cards: susp.cards, newsResults: news.results },
    };
  } catch (e) {
    log(`context layer error — degrading to no-op: ${e.message}`);
    return { enabled: true, applied: false, adjustments: {}, reasons: {}, coverage: null };
  }
}
