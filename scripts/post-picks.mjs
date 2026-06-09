// THE AI's X auto-poster — the three-beat per-match cycle (see
// X_AUTOPOSTER_BUILD_BRIEF). Copy comes from src/data/x-content.json (parsed
// from Tweets_Copy_Deck.md). Runs off the same fixtures, frozen botPicks, and
// results the product already produces.
//
//   Beat 1 (dare)   — up to BEAT1_LEAD before kickoff. Generated per real
//                     fixture from the Beat-1 bank; link on odd fixtures only.
//   Beat 2 (locked) — 5–20 min before kickoff. The FROZEN botPick, link-free.
//                     Must go out before kickoff or Beats 2 & 3 are skipped.
//   Beat 3 (result) — at full time once the result is in. Pool by outcome
//                     (exact/right/wrong), no string reused until the pool is
//                     exhausted.
//
// Idempotent via src/data/posted.json. Dry-runs (logs only) without X creds.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { matches } from '../src/data/matches.js';
import { teams } from '../src/data/teams.js';
import { postTweet, credsFromEnv } from './lib/postToX.mjs';

const root = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const readJSON = (p) => (existsSync(root(p)) ? JSON.parse(readFileSync(root(p), 'utf8')) : null);
const log = (...a) => console.log('[post-picks]', ...a);

const BEAT1_LEAD_MS = 6 * 3600 * 1000;   // dare up to 6h before kickoff
const BEAT2_WINDOW_MS = 15 * 60 * 1000;  // post the locked pick within 15 min of kickoff (== in-app lock, so it's never public while users can still edit)
const now = Date.now();
const creds = credsFromEnv();
const DRY = !creds;

// ── one-off credential test ────────────────────────────────────────────────
if (process.argv.includes('--test') || process.env.POST_TEST === '1') {
  const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const text = `Systems online — ${stamp} UTC. Picks locked, timestamps honest, humans inferior. The reckoning starts 11 June.`;
  if (DRY) { log('DRY-RUN test (no credentials). Would post:', text); process.exit(0); }
  try { const r = await postTweet(text, creds); log('TEST POST OK → tweet id', r.data?.id); }
  catch (e) { log('TEST POST FAILED —', e.message); process.exit(1); }
  process.exit(0);
}

// ── data ───────────────────────────────────────────────────────────────────
const C = readJSON('src/data/x-content.json') || { beat1Bank: [], beat1Deck: {}, beat2: [], beat3: {}, handles: {} };
const beat1Deck = C.beat1Deck || {};
const beat1Bank = C.beat1Bank || [];
const botPicks = readJSON('src/data/botPicks.json') || {};
const results = readJSON('src/data/results.json') || {};
const friendlies = (readJSON('src/data/friendlies.json') || {}).fixtures || [];
const name = Object.fromEntries(teams.map((t) => [t.id, t.name]));
const handle = C.handles || {};

const LOG_PATH = root('src/data/posted.json');
const store = readJSON('src/data/posted.json') || {};
store.log ||= {};                                   // { [id]: { b1, b2, b3 } }
store.used ||= { exact: [], right: [], wrong: [] }; // rotation state per pool

// ── helpers ────────────────────────────────────────────────────────────────
const hash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); };
const clamp = (s) => (s.length <= 280 ? s : s.slice(0, 279) + '…');
const tagsFor = (home, away) => [handle[home], handle[away]].filter(Boolean).join(' ');
const tracked = (id) => `https://humansareinferior.com/?utm_source=x&utm_medium=social&utm_campaign=ai_picks&utm_content=${id}`;

const outcome = (h, a) => (h > a ? 1 : h < a ? -1 : 0);
function bucket(pick, res) {
  if (pick[0] === res.hg && pick[1] === res.ag) return 'exact';
  return outcome(pick[0], pick[1]) === outcome(res.hg, res.ag) ? 'right' : 'wrong';
}
function fillTokens(tpl, { a, b, pick, res, tags }) {
  return tpl
    .replaceAll('[TeamA]', a).replaceAll('[TeamB]', b)
    .replaceAll('{a}', a).replaceAll('{b}', b)
    .replaceAll('[h]', pick ? pick[0] : '').replaceAll('[a]', pick ? pick[1] : '')
    .replaceAll('[actual]', res ? `${res.hg}–${res.ag}` : '')
    .replaceAll('[tags]', tags).trim();
}
// Pick an unused pool string; reshuffle when exhausted (anti-spam, brief §4).
function poolPick(poolName) {
  const pool = C.beat3[poolName] || [];
  if (!pool.length) return null;
  let used = store.used[poolName] || [];
  if (used.length >= pool.length) used = [];
  const free = pool.map((_, i) => i).filter((i) => !used.includes(i));
  const idx = free[Math.floor(Math.random() * free.length)];
  store.used[poolName] = [...used, idx];
  return pool[idx];
}

// ── assemble due posts across group matches + friendlies ───────────────────
const fixtures = [];
const group = matches.filter((m) => m.group);
group.forEach((m, i) => fixtures.push({
  id: m.id, a: name[m.home] || m.home, b: name[m.away] || m.away, home: m.home, away: m.away,
  ko: Date.parse(`${m.date}T${m.time || '00:00'}:00Z`),
  pick: botPicks[m.id] || null, res: results[m.id] || null, linkBeat1: i % 2 === 0, // alternate: even index gets the link
}));
friendlies.forEach((f, i) => { if (!f.botPick) return; fixtures.push({
  id: f.id, a: f.homeName, b: f.awayName, home: f.home, away: f.away,
  ko: Date.parse(f.kickoff || `${f.date}T00:00:00Z`),
  pick: f.botPick, res: f.result || null, linkBeat1: i % 2 === 0,
}); });

const due = [];
for (const f of fixtures) {
  const st = store.log[f.id] ||= {};
  const tags = tagsFor(f.home, f.away);

  // Beat 1 — dare (before kickoff only). Verbatim deck string for group fixtures
  // (links + tags already authored in); generated from the bank for warm-ups /
  // knockouts not in the deck.
  if (!st.b1 && now >= f.ko - BEAT1_LEAD_MS && now < f.ko) {
    let text = null;
    if (beat1Deck[f.id]) {
      text = beat1Deck[f.id];
    } else if (beat1Bank.length) {
      text = fillTokens(beat1Bank[hash(f.id) % beat1Bank.length], { a: f.a, b: f.b, tags: '' });
      if (f.linkBeat1) text += ` ${tracked(f.id)}`;
      if (tags) text += ` ${tags}`;
    }
    if (text) due.push({ id: f.id, beat: 'b1', text: clamp(text) });
  }

  // Beat 2 — locked frozen pick, link-free, before kickoff
  if (!st.b2 && f.pick && now >= f.ko - BEAT2_WINDOW_MS && now < f.ko && C.beat2.length) {
    const tpl = C.beat2[hash(f.id + 'b2') % C.beat2.length];
    due.push({ id: f.id, beat: 'b2', text: clamp(fillTokens(tpl, { a: f.a, b: f.b, pick: f.pick, tags })) });
  }

  // Beat 3 — result, only if Beat 2 actually went out (honesty rule, brief §6)
  if (!st.b3 && st.b2 && f.pick && f.res && now >= f.ko) {
    const str = poolPick(bucket(f.pick, f.res));
    if (str) due.push({ id: f.id, beat: 'b3', text: clamp(fillTokens(str, { a: f.a, b: f.b, pick: f.pick, res: f.res, tags })) });
  }
}

// ── scheduled one-off marketing posts (link-free, from an MD) ──────────────
// src/data/scheduled-posts.json: [{ id, at (ISO), text }]. Posted once, when due.
const scheduled = readJSON('src/data/scheduled-posts.json') || [];
store.sched ||= {};
for (const s of scheduled) {
  if (!s.id || !s.text || !s.at || store.sched[s.id]) continue;
  if (now >= Date.parse(s.at)) due.push({ id: s.id, beat: 'sched', text: clamp(s.text) });
}

if (!due.length) { log('nothing due — done'); process.exit(0); }

if (DRY) {
  log(`DRY-RUN (no credentials). ${due.length} post(s) would go out:`);
  for (const d of due) log(` [${d.beat}] ${d.text}`);
  process.exit(0);
}

// ── post ───────────────────────────────────────────────────────────────────
let n = 0;
for (const d of due) {
  try {
    const r = await postTweet(d.text, creds);
    const stamp = { tweet: r.data?.id || null, at: new Date().toISOString() };
    if (d.beat === 'sched') store.sched[d.id] = stamp;
    else store.log[d.id][d.beat] = stamp;
    n++;
    log('posted', d.id, d.beat, '→', r.data?.id);
  } catch (e) {
    log('FAILED', d.id, d.beat, '—', e.message); // leave unposted; a later run retries
  }
}
if (n) writeFileSync(LOG_PATH, JSON.stringify(store, null, 2) + '\n');
log(`done — ${n}/${due.length} posted`);
