import { useState } from 'react';
import { friendlyLocked, friendlyKickoff } from '../data.js';
import { setPick } from '../storage.js';
import { scorePick } from '../scoring.js';
import { MATCH, NAME } from '../voice.js';

const fmt = (f) =>
  friendlyKickoff(f).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
const pct = (x) => Math.round(x * 100);

function verdict(pick, r) {
  const s = scorePick(pick, r);
  if (s === 5) return ['THE AI nailed the exact score.', 'hit'];
  if (s >= 1) return ['THE AI called it.', 'hit'];
  return ['Even I allow chaos its rare moment.', 'miss'];
}

// Warm-up friendly. Win/draw/loss is shown openly (the marketing hook); the
// exact scoreline stays committed-but-hidden until kickoff, then is scored.
export default function FriendlyCard({ f, userPick, now }) {
  const locked = friendlyLocked(f, now);
  const result = f.result || null;
  const [draft, setDraft] = useState(userPick || [0, 0]);
  const committed = !!userPick;
  const p = f.prediction;

  return (
    <div className={`card ${!locked ? 'glow' : ''}`}>
      <div className="fmatch">
        <span className="nm r">{f.homeName}</span>
        <span className="mid">
          {result ? <span className="sc">{result.hg}–{result.ag}</span> : <span className="dim" style={{ fontSize: 12 }}>{fmt(f)}</span>}
        </span>
        <span className="nm">{f.awayName}</span>
      </div>

      <div className="probbar">
        <span className="w" style={{ width: `${pct(p.win)}%` }} />
        <span className="d" style={{ width: `${pct(p.draw)}%` }} />
        <span className="l" style={{ width: `${pct(p.loss)}%` }} />
      </div>
      <div className="problabels">
        <span>{pct(p.win)}% {f.homeName}</span>
        <span>{pct(p.draw)}% draw</span>
        <span>{pct(p.loss)}% {f.awayName}</span>
      </div>

      {!locked && (
        <>
          <div className="stepper">
            <div className="col">
              <button className="btn-step" onClick={() => setDraft([draft[0] + 1, draft[1]])}>+</button>
              <span className="val">{draft[0]}</span>
              <button className="btn-step" onClick={() => setDraft([Math.max(0, draft[0] - 1), draft[1]])}>−</button>
            </div>
            <span className="sep">–</span>
            <div className="col">
              <button className="btn-step" onClick={() => setDraft([draft[0], draft[1] + 1])}>+</button>
              <span className="val">{draft[1]}</span>
              <button className="btn-step" onClick={() => setDraft([draft[0], Math.max(0, draft[1] - 1)])}>−</button>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-ghost" onClick={() => setPick(f.id, draft, 'friendly')}>
              {committed ? `Update pick (${userPick[0]}–${userPick[1]})` : 'Commit pick'}
            </button>
          </div>
          {committed && <div className="voiceline">{MATCH.locked}</div>}
          <div className="hidden-pick">{MATCH.hiddenBot}</div>
        </>
      )}

      {locked && (
        <>
          <div className="pickrow you">
            <span className="who"><span className="dot" /> You</span>
            {committed ? <span className="pick">{userPick[0]}–{userPick[1]}</span> : <span className="pick dim">no pick</span>}
            {result && <span className="pts" style={{ color: 'var(--you)' }}>+{scorePick(userPick, result)}</span>}
          </div>
          <div className="pickrow ai">
            <span className="who"><span className="dot" /> {NAME}</span>
            <span className="pick">{f.botPick[0]}–{f.botPick[1]}</span>
            {result && <span className="pts" style={{ color: 'var(--ai)' }}>+{scorePick(f.botPick, result)}</span>}
          </div>
          {result && (() => { const [line, cls] = verdict(f.botPick, result); return <div className={`verdict ${cls}`}>{line}</div>; })()}
        </>
      )}
    </div>
  );
}
