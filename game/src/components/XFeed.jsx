import { xFeed } from '../data.js';

// THE AI's recent X posts, rendered from our OWN data (src/data/x-feed.json,
// written by the poster). X's official embed widget renders empty/unreliably, so
// we control the timeline ourselves — real posts, on-brand, always works. Each
// links to the actual tweet.

const HANDLE = 'inferiorhumans';
const X_URL = `https://x.com/${HANDLE}`;

function rel(iso) {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 0 || Number.isNaN(ms)) return '';
  const h = Math.floor(ms / 3600000);
  if (h < 1) return `${Math.max(1, Math.floor(ms / 60000))}m`;
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function XLogo() {
  return (
    <svg className="xlogo" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function Eye() {
  return (
    <span className="xavatar" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
      </svg>
    </span>
  );
}

export default function XFeed() {
  const posts = (xFeed || []).slice(0, 6);

  return (
    <div className="xfeed">
      <div className="xrule">
        <div className="xrule-h"><XLogo /> <span>@inferiorhumans</span></div>
        <p>
          Every pick is locked and <b>posted to X before kickoff</b>. Public. Timestamped.
          No edits, no hiding. Go ahead — screenshot it.
        </p>
      </div>

      {posts.map((p) => (
        <a key={p.id} className="xpost" href={`${X_URL}/status/${p.id}`} target="_blank" rel="noopener">
          <div className="xhead">
            <Eye />
            <span className="xname">THE AI</span>
            <svg className="xcheck" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 1l2.6 1.9 3.2-.1 1 3 2.6 1.9-1 3 1 3-2.6 1.9-1 3-3.2-.1L12 23l-2.6-1.9-3.2.1-1-3L2.6 16.3l1-3-1-3 2.6-1.9 1-3 3.2.1z" /></svg>
            <span className="xhandle">@inferiorhumans</span>
            {p.at && <span className="xtime">· {rel(p.at)}</span>}
            <XLogo />
          </div>
          <div className="xbody">{p.text}</div>
        </a>
      ))}

      <a className="xfollow" href={X_URL} target="_blank" rel="noopener">Follow the carnage on X →</a>
    </div>
  );
}
