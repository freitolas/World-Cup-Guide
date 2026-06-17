// On-demand PREVIEW of THE AI's picks for the next N hours of fixtures.
//
// Unlike the daily pipeline this NEVER freezes, writes, commits, or posts —
// it just prints. And it ALWAYS runs the news/context layer (the pipeline only
// calls the news APIs for fixtures already inside the freeze window), so you get
// a fresh, news-aware read on games that are still hours out.
//
//   PREVIEW_WINDOW_HOURS=20 node scripts/preview-picks.mjs
//
// News is only actually checked when API_FOOTBALL_KEY / NEWSDATA_KEY are set
// (run it via the "Preview picks (manual)" workflow, which injects the secrets).
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { matches } from '../src/data/matches.js';
import { teams } from '../src/data/teams.js';
import { matchProb, pickScore } from '../vendor/wc-model/elo.mjs';
import { buildRatings, HOSTS, HOME_ADV } from './lib/ratings.mjs';
import { fetchContext } from './lib/context.mjs';
import { computeMomentum } from './lib/momentum.mjs';
import { fetchFixtures, parseResults, kickoffMs } from './update.mjs';

const root = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const log = (...a) => console.log('[preview]', ...a);
const name = Object.fromEntries(teams.map((t) => [t.id, t.name]));

const WINDOW_H = Number(process.env.PREVIEW_WINDOW_HOURS || 20);
const now = Date.now();

// --- results (live feed, falling back to the committed file) → ratings input ---
let results = {};
let played = [];
const feed = await fetchFixtures();
if (feed) {
  const parsed = parseResults(feed);
  results = parsed.results;
  played = parsed.playedForModel;
  log(`feed ok — ${Object.keys(results).length} played group match(es)`);
} else if (existsSync(root('src/data/results.json'))) {
  results = JSON.parse(readFileSync(root('src/data/results.json'), 'utf8'));
  played = Object.values(results).map((r) => ({ homeSlug: r.home, awaySlug: r.away, hg: r.hg, ag: r.ag, date: r.date }));
  log('feed unreachable — using committed results.json');
}

const { ratings } = buildRatings(played);

// --- news/context: ALWAYS checked here. Apply the same adjustments the pipeline
// would, so the preview pick reflects suspensions/injuries/crisis. ---
const context = await fetchContext();
if (context.applied) {
  let n = 0;
  for (const [slug, penalty] of Object.entries(context.adjustments)) {
    if (ratings[slug] != null) { ratings[slug] -= penalty; n++; }
  }
  log(`context APPLIED — adjusted ${n} team rating(s)`);
} else if (context.enabled) {
  log('context checked but NOT applied (CONTEXT_ENABLED!=1) — showing signals only, ratings unchanged');
} else {
  log('context inactive — NO news keys present, so news was NOT actually checked');
}

// --- momentum & morale overlay (needs no API keys; mirrors the live pipeline) ---
let priorFriendlies = [];
try { priorFriendlies = JSON.parse(readFileSync(root('src/data/friendlies.json'), 'utf8')).fixtures || []; } catch { /* none */ }
const momentum = computeMomentum(ratings, { wcResults: results, friendlies: priorFriendlies });
let moraleMoved = 0;
for (const [slug, delta] of Object.entries(momentum.morale)) {
  if (ratings[slug] != null) { ratings[slug] += delta; moraleMoved++; }
}
log(`morale overlay — ${moraleMoved} team(s) adjusted (signed)`);
context.reasons = context.reasons || {};
for (const [slug, arr] of Object.entries(momentum.reasons)) {
  context.reasons[slug] = [...(context.reasons[slug] || []), ...arr];
}

// --- fixtures kicking off within the window ---
const upcoming = matches
  .filter((m) => !results[m.id] && ratings[m.home] != null && ratings[m.away] != null)
  .map((m) => ({ m, ko: kickoffMs(m), hoursOut: (kickoffMs(m) - now) / 3.6e6 }))
  .filter((x) => x.hoursOut >= 0 && x.hoursOut <= WINDOW_H)
  .sort((a, b) => a.ko - b.ko);

const pct = (x) => `${Math.round(x * 100)}%`;
const reasonsFor = (slug) => (context.reasons && context.reasons[slug]) || [];

log(`=== PREVIEW — next ${WINDOW_H}h: ${upcoming.length} fixture(s). NOT frozen, NOT written, NOT posted. ===`);
for (const { m, ko, hoursOut } of upcoming) {
  const rh = ratings[m.home];
  const ra = ratings[m.away];
  const hb = HOSTS.has(m.home) ? HOME_ADV : 0;
  const [hg, ag] = pickScore(rh, ra, hb);
  const p = matchProb(rh, ra, hb);
  const a = name[m.home] || m.home;
  const b = name[m.away] || m.away;
  const koStr = new Date(ko).toISOString().slice(0, 16).replace('T', ' ');
  log(`\n${a} v ${b}  (KO ${koStr} UTC, in ${hoursOut.toFixed(1)}h)`);
  log(`  pick: ${a} ${hg}–${ag} ${b}`);
  log(`  win/draw/loss: ${pct(p.winA)} / ${pct(p.draw)} / ${pct(p.winB)}   xG: ${p.expectedGoalsA.toFixed(2)}–${p.expectedGoalsB.toFixed(2)}`);
  const rA = reasonsFor(m.home);
  const rB = reasonsFor(m.away);
  if (rA.length) log(`  ${a} news: ${rA.join('; ')} (−${context.adjustments[m.home] || 0})`);
  if (rB.length) log(`  ${b} news: ${rB.join('; ')} (−${context.adjustments[m.away] || 0})`);
  if (!rA.length && !rB.length) log('  news: no injury/suspension/crisis signals for either side');
}
// --- Telegram digest: build ONE message and POST it to the SAME webhook as the
// freeze notifications (MAKE_FREEZE_WEBHOOK). Still never freezes/writes/commits.
// 🔒 marks fixtures already locked by the pipeline. Kickoffs shown in UK time.
const picks = existsSync(root('src/data/botPicks.json'))
  ? JSON.parse(readFileSync(root('src/data/botPicks.json'), 'utf8'))
  : {};
const ukTime = (ms) => new Date(ms).toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit' });

const lines = upcoming.map(({ m, ko }) => {
  const hb = HOSTS.has(m.home) ? HOME_ADV : 0;
  const frozen = picks[m.id];
  const [hg, ag] = frozen || pickScore(ratings[m.home], ratings[m.away], hb);
  const a = name[m.home] || m.home;
  const b = name[m.away] || m.away;
  const sigs = [
    ...reasonsFor(m.home).map((s) => `${a}: ${s}`),
    ...reasonsFor(m.away).map((s) => `${b}: ${s}`),
  ];
  const why = sigs.length ? `\n   ↳ ${sigs.join('; ')}` : '';
  return `• ${ukTime(ko)}  ${a} ${hg}–${ag} ${b}${frozen ? ' 🔒' : ''}${why}`;
});

const header = `📋 THE AI — next ${WINDOW_H}h of picks (as of ${ukTime(now)} UK)`;
const text = upcoming.length
  ? `${header}\n\n${lines.join('\n')}\n\nProjections move until each game locks ~hours before kickoff. 🔒 = already locked.`
  : `${header}\n\nNo matches kicking off in the next ${WINDOW_H}h.`;

const webhook = process.env.MAKE_FREEZE_WEBHOOK || '';
if (!webhook) {
  log('MAKE_FREEZE_WEBHOOK unset — digest printed above only, not sent to Telegram');
} else {
  try {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'daily_preview', generatedAt: new Date(now).toISOString(), windowHours: WINDOW_H, count: upcoming.length, text }),
      signal: AbortSignal.timeout(15000),
    });
    log(`Telegram digest POST: HTTP ${res.status} (${upcoming.length} fixture(s))`);
  } catch (e) {
    log(`Telegram digest POST failed: ${e.message}`);
  }
}

log('\n[preview] done — nothing was frozen, written, or committed.');
