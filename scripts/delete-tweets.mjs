// One-off retraction tool: delete specific tweets by id.
//
//   node scripts/delete-tweets.mjs 123 456        ids as args, or
//   IDS="123,456" node scripts/delete-tweets.mjs  ids from env (CI input)
//
// Dry-runs (logs only) without X credentials. Manual use only — there is no
// schedule. Use it to retract a mis-fired post; remember to also clear the
// matching entry from src/data/posted.json so the poster can re-post correctly.
import { deleteTweet, credsFromEnv } from './lib/postToX.mjs';

const log = (...a) => console.log('[delete-tweets]', ...a);
const ids = [
  ...process.argv.slice(2),
  ...(process.env.IDS ? process.env.IDS.split(',') : []),
].map((s) => s.trim()).filter(Boolean);

if (!ids.length) { log('no tweet ids given (args or IDS env) — nothing to do'); process.exit(0); }

const creds = credsFromEnv();
if (!creds) { log('DRY-RUN (no credentials). Would delete:', ids.join(', ')); process.exit(0); }

let ok = 0;
for (const id of ids) {
  try {
    const r = await deleteTweet(id, creds);
    const deleted = r?.data?.deleted;
    log(`${id} → deleted=${deleted}`);
    if (deleted) ok++;
  } catch (e) {
    log(`${id} → FAILED: ${e.message}`);
  }
}
log(`done — ${ok}/${ids.length} deleted`);
if (ok < ids.length) process.exitCode = 1;
