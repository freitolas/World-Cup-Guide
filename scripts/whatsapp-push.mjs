// THE AI's WhatsApp predictions push. Reuses the frozen picks + the same dense
// off-peak schedule as the X poster. Each run finds fixtures kicking off within
// 15 min that have a frozen pick and haven't been pushed, and sends the locked
// scoreline to every ACTIVE subscriber (Supabase). Idempotent via
// src/data/whatsapp-sent.json. Dry-runs (logs only) without provider/Supabase creds.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { matches } from '../src/data/matches.js';
import { teams } from '../src/data/teams.js';
import { sendTemplate, credsFromEnv } from './lib/whatsapp.mjs';

const root = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const readJSON = (p) => (existsSync(root(p)) ? JSON.parse(readFileSync(root(p), 'utf8')) : null);
const log = (...a) => console.log('[wa-push]', ...a);

const PUSH_WINDOW_MS = 15 * 60 * 1000; // send within 15 min of kickoff (== the lock)
const now = Date.now();

const name = Object.fromEntries(teams.map((t) => [t.id, t.name]));
const botPicks = readJSON('src/data/botPicks.json') || {};
const friendlies = (readJSON('src/data/friendlies.json') || {}).fixtures || [];
const SENT_PATH = root('src/data/whatsapp-sent.json');
const sent = readJSON('src/data/whatsapp-sent.json') || {};

const fixtures = [];
for (const m of matches.filter((x) => x.group)) {
  const pick = botPicks[m.id];
  if (pick) fixtures.push({ id: m.id, a: name[m.home] || m.home, b: name[m.away] || m.away, ko: Date.parse(`${m.date}T${m.time || '00:00'}:00Z`), pick });
}
for (const f of friendlies) {
  if (f.botPick) fixtures.push({ id: f.id, a: f.homeName, b: f.awayName, ko: Date.parse(f.kickoff || `${f.date}T00:00:00Z`), pick: f.botPick });
}

const due = fixtures.filter((f) => !sent[f.id] && f.ko - now > 0 && f.ko - now <= PUSH_WINDOW_MS);
if (!due.length) { log('nothing within 15 min — done'); process.exit(0); }

async function activeSubscribers() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) { log('no Supabase service creds — 0 subscribers (dry-run)'); return []; }
  const res = await fetch(`${url}/rest/v1/whatsapp_subscribers?active=eq.true&select=phone`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  return (await res.json()).map((r) => r.phone).filter(Boolean);
}

const creds = credsFromEnv();
const subs = await activeSubscribers();
log(`${due.length} match(es) due · ${subs.length} active subscriber(s)`);

let pushed = 0;
for (const f of due) {
  const score = `${f.pick[0]}–${f.pick[1]}`;
  if (!creds || !subs.length) {
    log(`[dry] ${f.a} v ${f.b} → ${score} (would send to ${subs.length} subscriber(s))`);
  } else {
    for (const phone of subs) {
      try { await sendTemplate(phone, [f.a, f.b, score], creds); pushed++; }
      catch (e) { log('send FAILED', phone, '—', e.message); }
    }
  }
  sent[f.id] = { at: new Date().toISOString(), subscribers: subs.length };
}
writeFileSync(SENT_PATH, JSON.stringify(sent, null, 2) + '\n');
log(`done — ${pushed} message(s) sent across ${due.length} match(es)`);
