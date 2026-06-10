// THE AI's paid predictions push → Make.com. At the 15-min lock, fire one Make
// webhook per imminent fixture with the FROZEN pick. Make handles the rest:
// Stripe → subscriber list → Telegram fan-out. Reuses the prediction engine and
// the same dense schedule as the X poster. Idempotent via src/data/make-sent.json.
// No-op (dry-run) without MAKE_WEBHOOK_URL.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { matches } from '../src/data/matches.js';
import { teams } from '../src/data/teams.js';

const root = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const readJSON = (p) => (existsSync(root(p)) ? JSON.parse(readFileSync(root(p), 'utf8')) : null);
const log = (...a) => console.log('[notify-make]', ...a);

const WINDOW_MS = 15 * 60 * 1000; // fire within 15 min of kickoff (== the lock)
const now = Date.now();
const WEBHOOK = process.env.MAKE_WEBHOOK_URL;

const name = Object.fromEntries(teams.map((t) => [t.id, t.name]));
const botPicks = readJSON('src/data/botPicks.json') || {};
const friendlies = (readJSON('src/data/friendlies.json') || {}).fixtures || [];
const SENT_PATH = root('src/data/make-sent.json');
const sent = readJSON('src/data/make-sent.json') || {};

const fixtures = [];
for (const m of matches.filter((x) => x.group)) {
  const pick = botPicks[m.id];
  if (pick) fixtures.push({ id: m.id, teamA: name[m.home] || m.home, teamB: name[m.away] || m.away, ko: Date.parse(`${m.date}T${m.time || '00:00'}:00Z`), pick });
}
for (const f of friendlies) {
  if (f.botPick) fixtures.push({ id: f.id, teamA: f.homeName, teamB: f.awayName, ko: Date.parse(f.kickoff || `${f.date}T00:00:00Z`), pick: f.botPick });
}

const due = fixtures.filter((f) => !sent[f.id] && f.ko - now > 0 && f.ko - now <= WINDOW_MS);
if (!due.length) { log('nothing within 15 min — done'); process.exit(0); }

let fired = 0;
for (const f of due) {
  const payload = {
    matchId: f.id,
    teamA: f.teamA,
    teamB: f.teamB,
    pick: f.pick,                       // [home, away]
    score: `${f.pick[0]}-${f.pick[1]}`, // "h-a"
    kickoff: new Date(f.ko).toISOString(),
  };
  if (!WEBHOOK) { log('[dry] would fire →', JSON.stringify(payload)); sent[f.id] = { at: new Date().toISOString(), dry: true }; continue; }
  try {
    const res = await fetch(WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    sent[f.id] = { at: new Date().toISOString() };
    fired++;
    log('fired', f.id, `${f.teamA} ${payload.score} ${f.teamB}`);
  } catch (e) {
    log('FIRE FAILED', f.id, '—', e.message); // leave unsent; a later run retries
  }
}
// In dry-run we don't persist (so a real run still fires); only persist real fires.
if (fired) writeFileSync(SENT_PATH, JSON.stringify(sent, null, 2) + '\n');
log(`done — ${fired}/${due.length} fired`);
