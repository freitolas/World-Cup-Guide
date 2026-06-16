// Post a tweet as THE AI via the X API v2 (POST /2/tweets), signed with OAuth
// 1.0a user context. No external deps — Node's crypto does the HMAC-SHA1.
//
// Requires an X app with **Read and Write** permission and these env secrets:
//   X_API_KEY, X_API_SECRET            (app consumer key/secret)
//   X_ACCESS_TOKEN, X_ACCESS_SECRET    (the @inferiorhumans account's tokens)
import crypto from 'node:crypto';

const ENDPOINT = 'https://api.twitter.com/2/tweets';

// RFC-3986 percent-encoding (stricter than encodeURIComponent).
const enc = (s) =>
  encodeURIComponent(s).replace(/[!*'()]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());

export function credsFromEnv(env = process.env) {
  const c = {
    apiKey: env.X_API_KEY,
    apiSecret: env.X_API_SECRET,
    accessToken: env.X_ACCESS_TOKEN,
    accessSecret: env.X_ACCESS_SECRET,
  };
  return Object.values(c).every(Boolean) ? c : null;
}

// Build the OAuth 1.0a Authorization header. For a JSON-body POST, only the
// oauth_* parameters go into the signature base string (the JSON body does not).
function authHeader(method, url, creds) {
  const oauth = {
    oauth_consumer_key: creds.apiKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: creds.accessToken,
    oauth_version: '1.0',
  };
  const paramString = Object.keys(oauth).sort()
    .map((k) => `${enc(k)}=${enc(oauth[k])}`).join('&');
  const base = [method.toUpperCase(), enc(url), enc(paramString)].join('&');
  const signingKey = `${enc(creds.apiSecret)}&${enc(creds.accessSecret)}`;
  oauth.oauth_signature = crypto.createHmac('sha1', signingKey).update(base).digest('base64');
  return 'OAuth ' + Object.keys(oauth).sort()
    .map((k) => `${enc(k)}="${enc(oauth[k])}"`).join(', ');
}

export async function postTweet(text, creds) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: authHeader('POST', ENDPOINT, creds),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`X API ${res.status}: ${JSON.stringify(data)}`);
  return data; // { data: { id, text } }
}

// Delete a tweet by id (DELETE /2/tweets/:id), OAuth 1.0a user context. Used to
// retract a mis-fired post (e.g. a Beat-2 that went out early on a bad kickoff
// time). Returns { data: { deleted: true } }.
export async function deleteTweet(id, creds) {
  const url = `${ENDPOINT}/${id}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: authHeader('DELETE', url, creds) },
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`X API ${res.status}: ${JSON.stringify(data)}`);
  return data; // { data: { deleted: true|false } }
}
