import { friendlies } from '../data.js';
import { scorePick } from '../scoring.js';

// THE AI's "live" X timeline. Stylized like an X feed, but the posts are built
// from REAL recent warm-up predictions (its locked pick + the actual result) —
// so the content is true, not invented. Swap for a real X embed when ready.

const X_URL = 'https://x.com/inferiorhumans';

function rel(iso) {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 0) return 'now';
  const h = Math.floor(ms / 3600000);
  if (h < 1) return `${Math.max(1, Math.floor(ms / 60000))}m`;
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function postFor(f) {
  const s = scorePick(f.botPick, f.result);
  const me = `${f.homeName} ${f.botPick[0]}–${f.botPick[1]} ${f.awayName}`;
  const fin = `${f.result.hg}–${f.result.ag}`;
  const text =
    s >= 5 ? `Locked before kickoff: ${me}. Final: ${fin}. Exact. I don't guess — I compute.`
    : s >= 1 ? `Called it. I posted ${me} before a ball was kicked. Final: ${fin}. Predictable. Literally.`
    : `I had ${me}. Reality returned ${fin}. Football gets its rare accident. Repriced. Carry on.`;
  return { id: f.id, text, time: rel(f.kickoff), hit: s >= 1 };
}

function EyeAvatar() {
  return (
    <span className="xavatar" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
      </svg>
    </span>
  );
}

function XLogo() {
  return (
    <svg className="xlogo" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function XFeed() {
  const recent = friendlies
    .filter((f) => f.result)
    .sort((a, b) => String(b.kickoff).localeCompare(String(a.kickoff)))
    .slice(0, 3)
    .map(postFor);

  const pinned = {
    id: 'pinned',
    text: 'I post every pick before kickoff. Publicly. To everyone. Then I win anyway. The timestamps don’t lie. You do.',
    time: null,
    hit: true,
    pin: true,
  };

  const posts = [pinned, ...recent];

  return (
    <div className="xfeed">
      {posts.map((p) => (
        <a key={p.id} className="xpost" href={X_URL} target="_blank" rel="noopener">
          {p.pin && <div className="xpin">📌 Pinned</div>}
          <div className="xhead">
            <EyeAvatar />
            <span className="xname">THE AI</span>
            <svg className="xcheck" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 1l2.6 1.9 3.2-.1 1 3 2.6 1.9-1 3 1 3-2.6 1.9-1 3-3.2-.1L12 23l-2.6-1.9-3.2.1-1-3L2.6 16.3l1-3-1-3 2.6-1.9 1-3 3.2.1z" /></svg>
            <span className="xhandle">@inferiorhumans</span>
            {p.time && <span className="xtime">· {p.time}</span>}
            <XLogo />
          </div>
          <div className="xbody">{p.text}</div>
          <div className="xmeta">
            <span>💬 {p.hit ? 214 : 902}</span>
            <span>🔁 {p.hit ? 87 : 41}</span>
            <span>♡ {p.hit ? 1203 : 196}</span>
          </div>
        </a>
      ))}
      <a className="xfollow" href={X_URL} target="_blank" rel="noopener">Follow the carnage on X →</a>
    </div>
  );
}
