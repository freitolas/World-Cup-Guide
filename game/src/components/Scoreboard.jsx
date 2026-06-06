import { NAME, SCOREBOARD } from '../voice.js';

// Pinned personal duel — You vs THE AI. Always visible at the top of the game.
export default function Scoreboard({ tally }) {
  const { you, ai, played, forfeits } = tally;

  let note;
  if (played === 0) note = SCOREBOARD.empty;
  else if (you > ai) note = SCOREBOARD.ahead;
  else if (you === ai) note = SCOREBOARD.level;
  else note = SCOREBOARD.behind;

  return (
    <div className="scorebar">
      <div className="row">
        <span className="score you">
          <span className="label">You</span>
          <span className="num">{you}</span>
        </span>
        <span className="vs mono">vs</span>
        <span className="score ai">
          <span className="num">{ai}</span>
          <span className="label">{NAME}</span>
        </span>
      </div>
      <div className="scoreline-note">
        {note}
        {played > 0 && (
          <span className="dim">
            {'  ·  '}
            {played} scored{forfeits > 0 ? ` · ${forfeits} forfeit${forfeits > 1 ? 's' : ''}` : ''}
          </span>
        )}
      </div>
    </div>
  );
}
