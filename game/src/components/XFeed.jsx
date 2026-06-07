import { useState, useEffect, useRef } from 'react';

// THE AI's REAL X timeline (@inferiorhumans), styled to fit. Click-to-load so we
// don't pull X's third-party script/cookies until the visitor opts in (keeps it
// honest with the cookie banner). Until the auto-poster is live the timeline may
// be sparse — but it's real, never fabricated.

const HANDLE = 'inferiorhumans';
const X_URL = `https://x.com/${HANDLE}`;

function XLogo() {
  return (
    <svg className="xlogo" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function XFeed() {
  const [show, setShow] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!show) return;
    const id = 'twitter-wjs';
    const load = () => window.twttr?.widgets?.load(ref.current);
    if (document.getElementById(id)) { load(); return; }
    const s = document.createElement('script');
    s.id = id;
    s.async = true;
    s.src = 'https://platform.twitter.com/widgets.js';
    s.onload = load;
    document.body.appendChild(s);
  }, [show]);

  return (
    <div className="xfeed">
      <div className="xrule">
        <div className="xrule-h"><XLogo /> <span>@inferiorhumans</span></div>
        <p>
          Every pick is locked and <b>posted to X five minutes before kickoff</b>. Public.
          Timestamped. No edits, no hiding. Go ahead — screenshot it.
        </p>
        {!show && (
          <button className="btn btn-ghost" onClick={() => setShow(true)}>Show live posts from X →</button>
        )}
      </div>

      {show && (
        <div className="xembed" ref={ref}>
          <a
            className="twitter-timeline"
            data-theme="dark"
            data-chrome="noheader nofooter noborders transparent"
            data-dnt="true"
            data-tweet-limit="3"
            href={`https://twitter.com/${HANDLE}`}
          >
            Posts from @inferiorhumans
          </a>
        </div>
      )}

      <a className="xfollow" href={X_URL} target="_blank" rel="noopener">Follow the carnage on X →</a>
    </div>
  );
}
