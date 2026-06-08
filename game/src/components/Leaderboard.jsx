import { humansAhead } from '../data.js';
import { LEADERBOARD, pick as choose } from '../voice.js';
import { go } from '../hooks.js';

// The global leaderboard — humans who've beaten THE AI. Empty by default (no
// global pick-sync yet), which is the honest taunt state. Flips automatically
// the moment src/data/leaderboard.json gains an entry where you > ai.
export default function Leaderboard() {
  const top = humansAhead[0] || null;

  return (
    <div className="pad">
      <div className="titlecard">
        <div className="chapter">The Members' Roll</div>
        <h1>{LEADERBOARD.title}</h1>
        <p className="sub">A short, sad list of humans who've actually beaten me. I keep it short on purpose.</p>
      </div>

      <div className="rule"><span className="d">◆</span></div>

      {!top ? (
        <div className="card center lb-empty">
          <div className="lb-taunt">{LEADERBOARD.empty}</div>
          <p className="muted">{LEADERBOARD.emptySub}</p>
          <button className="btn btn-primary" onClick={() => go('/play')}>Try to be the first →</button>
        </div>
      ) : (
        <>
          <div className="card lb-first">
            <div className="lb-medal">★ 1ST</div>
            <div className="lb-name">{top.name}</div>
            <div className="lb-score">
              <span className="you">{top.you}</span>
              <span className="dim"> vs </span>
              <span className="ai">{top.ai}</span>
              <span className="dim"> · THE AI</span>
            </div>
            <div className="voiceline">{choose(LEADERBOARD.beaten, String(top.name))}</div>
          </div>

          {humansAhead.length > 1 && (
            <div className="stack" style={{ marginTop: 12 }}>
              {humansAhead.slice(1).map((l, i) => (
                <div key={l.name + i} className="lb-row">
                  <span className="lb-pos">#{i + 2}</span>
                  <span className="lb-rowname">{l.name}</span>
                  <span className="lb-rowscore"><span className="you">{l.you}</span><span className="dim">–</span><span className="ai">{l.ai}</span></span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <div className="foot"><a href="#/">← back to THE AI</a></div>
    </div>
  );
}
