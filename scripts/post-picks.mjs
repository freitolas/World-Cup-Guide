// THE AI posts its frozen pick shortly before kickoff — public, timestamped, no
// edits (the honesty mechanic). Run on a schedule a few minutes before each
// kickoff slot (see .github/workflows/post-picks.yml). Idempotent: every posted
// fixture id is recorded in src/data/posted.json so nothing is ever tweeted
// twice. Without X credentials it runs in DRY-RUN and just logs what it would
// post (and writes nothing), so it's safe to test.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { matches } from '../src/data/matches.js';
import { teams } from '../src/data/teams.js';
import { postTweet, credsFromEnv } from './lib/postToX.mjs';

const root = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const readJSON = (p) => (existsSync(root(p)) ? JSON.parse(readFileSync(root(p), 'utf8')) : null);
const log = (...a) => console.log('[post-picks]', ...a);

// How far ahead of kickoff we post. The cron fires ~10 min before each slot; a
// 15-min window absorbs GitHub's scheduling jitter while staying before kickoff.
const LEAD_MIN = Number(process.env.POST_LEAD_MIN || 15);
const now = Date.now();

// --test: post one off-brand-safe status tweet right now to verify the X
// credentials end-to-end (ignores the kickoff window + idempotency). The
// timestamp keeps each test unique so X doesn't reject it as a duplicate.
if (process.argv.includes('--test') || process.env.POST_TEST === '1') {
  const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const text = `Systems online — ${stamp} UTC. Picks locked, timestamps honest, humans inferior. The reckoning starts 11 June. humansareinferior.com`;
  const creds = credsFromEnv();
  if (!creds) { log('DRY-RUN test (no credentials). Would post:', text); process.exit(0); }
  try {
    const r = await postTweet(text, creds);
    log('TEST POST OK → tweet id', r.data?.id);
    log('text:', r.data?.text);
  } catch (e) {
    log('TEST POST FAILED —', e.message);
    process.exit(1);
  }
  process.exit(0);
}

const teamName = Object.fromEntries(teams.map((t) => [t.id, t.name]));
const botPicks = readJSON('src/data/botPicks.json') || {};
const friendlies = (readJSON('src/data/friendlies.json') || {}).fixtures || [];
const POSTED_PATH = root('src/data/posted.json');
const posted = readJSON('src/data/posted.json') || {};

const imminent = (ko) => ko >= now && ko - now <= LEAD_MIN * 60000;
const clamp = (s) => (s.length <= 280 ? s : s.slice(0, 279) + '…');

function composeWC(m, pick) {
  const h = teamName[m.home] || m.home;
  const a = teamName[m.away] || m.away;
  return clamp(`🔒 Before kickoff, as always: ${h} ${pick[0]}–${pick[1]} ${a}. Locked, public, no edits. Beat me → humansareinferior.com`);
}
function composeFriendly(f) {
  return clamp(`🔒 Warm-up, locked before kickoff: ${f.homeName} ${f.botPick[0]}–${f.botPick[1]} ${f.awayName}. I never hide a pick. Beat me → humansareinferior.com`);
}

const due = [];
for (const m of matches) {
  if (posted[m.id]) continue;
  const pick = botPicks[m.id];
  if (!pick) continue; // pick not frozen yet — skip; a later run will catch it
  const ko = Date.parse(`${m.date}T${m.time || '00:00'}:00Z`);
  if (imminent(ko)) due.push({ id: m.id, text: composeWC(m, pick) });
}
for (const f of friendlies) {
  if (f.result || posted[f.id] || !f.botPick) continue;
  const ko = Date.parse(f.kickoff || `${f.date}T00:00:00Z`);
  if (imminent(ko)) due.push({ id: f.id, text: composeFriendly(f) });
}

if (!due.length) { log('nothing imminent within', LEAD_MIN, 'min — done'); process.exit(0); }

const creds = credsFromEnv();
if (!creds) {
  log('DRY-RUN (no X credentials). Would post:');
  for (const d of due) log(' •', d.text);
  process.exit(0);
}

let n = 0;
for (const d of due) {
  try {
    const r = await postTweet(d.text, creds);
    posted[d.id] = { at: new Date().toISOString(), tweet: r.data?.id || null };
    n++;
    log('posted', d.id, '→', r.data?.id);
  } catch (e) {
    log('FAILED', d.id, '—', e.message); // leave unposted so the next run retries
  }
}
if (n) writeFileSync(POSTED_PATH, JSON.stringify(posted, null, 2) + '\n');
log(`done — ${n}/${due.length} posted`);
