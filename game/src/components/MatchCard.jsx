import { useState } from 'react';
import { team, kickoff, isLocked, resultFor, botPickFor } from '../data.js';
import { setPick } from '../storage.js';
import { scorePick } from '../scoring.js';
import { MATCH, NAME, pick as choose } from '../voice.js';
import { go } from '../hooks.js';

const fmtKick = (m) =>
  kickoff(m).toLocaleString(undefined, {
    weekday: 'short', hour: '2-digit', minute: '2-digit',
  });

function Team({ id, onOpen }) {
  const t = team(id);
  return (
    <div className="team" onClick={onOpen}>
      <span className="flag">{t.flag}</span>
      <span className="nm">{t.name}</span>
    </div>
  );
}

function Stepper({ value, onChange, colorClass }) {
  return (
    <div className="col">
      <button className="btn-step" onClick={() => onChange(value + 1)} aria-label="increase">+</button>
      <span className="val" style={colorClass}>{value}</span>
      <button className="btn-step" onClick={() => onChange(Math.max(0, value - 1))} aria-label="decrease">−</button>
    </div>
  );
}

export default function MatchCard({ match, userPick, now }) {
  const locked = isLocked(match, now);
  const result = resultFor(match);
  const botPick = botPickFor(match);

  const [draft, setDraft] = useState(userPick || [0, 0]);
  const committed = !!userPick;

  const openTeam = (id) => go(`/team/${id}`);

  return (
    <div className={`card match ${!locked ? 'glow' : ''}`}>
      <div className="meta">
        <span>{match.group ? `Group ${match.group}` : 'Match'} · {match.venue}</span>
        <span className="locktag">{locked ? 'Locked' : 'Open'}</span>
      </div>

      <div className="teams">
        <Team id={match.home} onOpen={() => openTeam(match.home)} />
        <span className="kick">
          {result ? (
            <span className="mono" style={{ fontSize: 22, color: 'var(--text)' }}>
              {result.hg}–{result.ag}
            </span>
          ) : (
            fmtKick(match)
          )}
        </span>
        <Team id={match.away} onOpen={() => openTeam(match.away)} />
      </div>

      {/* BEFORE LOCK: make / edit a pick. THE AI's pick stays hidden. */}
      {!locked && (
        <>
          <div className="stepper">
            <Stepper value={draft[0]} onChange={(v) => setDraft([v, draft[1]])} colorClass={{}} />
            <span className="sep">–</span>
            <Stepper value={draft[1]} onChange={(v) => setDraft([draft[0], v])} colorClass={{}} />
          </div>
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-ghost" onClick={() => setPick(match.id, draft)}>
              {committed ? `Update pick (${userPick[0]}–${userPick[1]})` : 'Commit pick'}
            </button>
          </div>
          {committed && <div className="voiceline">{MATCH.locked}</div>}
          <div className="hidden-pick">{MATCH.hiddenBot}</div>
        </>
      )}

      {/* AT/AFTER LOCK: reveal both picks and (if resolved) the points. */}
      {locked && (
        <>
          <div className={`pickrow you`}>
            <span className="who"><span className="dot" /> You</span>
            {committed ? (
              <span className="pick">{userPick[0]}–{userPick[1]}</span>
            ) : (
              <span className="pick dim">no pick</span>
            )}
            {result && <span className="pts" style={{ color: 'var(--you)' }}>+{scorePick(userPick, result)}</span>}
          </div>
          <div className={`pickrow ai`}>
            <span className="who"><span className="dot" /> {NAME}</span>
            <span className="pick">{botPick ? `${botPick[0]}–${botPick[1]}` : '—'}</span>
            {result && <span className="pts" style={{ color: 'var(--ai)' }}>+{scorePick(botPick, result)}</span>}
          </div>
          <div className="voiceline">{revealLine(match, userPick, botPick, result)}</div>
        </>
      )}
    </div>
  );
}

function revealLine(match, userPick, botPick, result) {
  if (!result) {
    return !userPick ? MATCH.forfeit : MATCH.reveal;
  }
  if (!userPick) return MATCH.forfeit;
  const you = scorePick(userPick, result);
  const ai = scorePick(botPick, result);
  if (you > ai) return MATCH.youWon;
  if (you < ai) return MATCH.botWon;
  return choose([MATCH.drewLevel], match.id);
}
