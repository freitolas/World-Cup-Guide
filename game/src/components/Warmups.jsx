import { useMemo } from 'react';
import AiMark from './AiMark.jsx';
import Scoreboard from './Scoreboard.jsx';
import FriendlyCard from './FriendlyCard.jsx';
import { friendlies, friendlyKickoff } from '../data.js';
import { scorePick } from '../scoring.js';
import { usePicks, useNow } from '../hooks.js';
import { getStartedAt } from '../storage.js';

// The Warm-ups dossier: THE AI's record on pre-tournament friendlies (live
// marketing content) + the playable upcoming ones. Fully isolated from the
// World Cup game (own 'friendly' pick namespace, own data file).
export default function Warmups() {
  const picks = usePicks('friendly');
  const now = useNow();

  const played = friendlies.filter((f) => f.result);
  const upcoming = friendlies
    .filter((f) => !f.result)
    .sort((a, b) => String(a.kickoff).localeCompare(String(b.kickoff)));
  const recent = played.slice().sort((a, b) => String(b.kickoff).localeCompare(String(a.kickoff)));

  // THE AI's all-time warm-up record (independent of the player).
  const rec = useMemo(() => {
    let exact = 0, correct = 0;
    for (const f of played) {
      const s = scorePick(f.botPick, f.result);
      if (s === 5) exact++;
      if (s >= 1) correct++;
    }
    return { exact, correct, total: played.length };
  }, [played]);

  // The personal duel: only matches that kicked off after the player arrived.
  const duel = useMemo(() => {
    const startedAt = getStartedAt();
    let you = 0, ai = 0, n = 0, forfeits = 0;
    for (const f of played) {
      if (friendlyKickoff(f).getTime() < startedAt) continue; // before you showed up — not yours to forfeit
      n++;
      const hp = picks[f.id];
      if (!hp) forfeits++;
      you += scorePick(hp || null, f.result);
      ai += scorePick(f.botPick, f.result);
    }
    return { you, ai, played: n, forfeits };
  }, [picks]); // eslint-disable-line react-hooks/exhaustive-deps

  const hitRate = rec.total ? Math.round((rec.correct / rec.total) * 100) : 0;

  return (
    <div>
      <Scoreboard tally={duel} />
      <div className="pad">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="#/" className="dim" style={{ fontSize: 12 }}>← home</a>
          <AiMark />
        </div>

        <div className="titlecard">
          <div className="chapter">An Appendix · The Warm-Ups</div>
          <h1>The Tune-Up Dossier</h1>
          <p className="sub">While you stretch, I have already filed the outcomes. Consider it a rehearsal for your defeat.</p>
        </div>

        <div className="rule"><span className="d">◆</span></div>

        <div className="card">
          <div className="ledger">
            <div className="stat"><div className="v">{rec.correct}/{rec.total}</div><div className="k">Results called</div></div>
            <div className="stat"><div className="v">{rec.exact}</div><div className="k">Exact scores</div></div>
            <div className="stat"><div className="v">{hitRate}%</div><div className="k">Hit rate</div></div>
          </div>
          <div className="voiceline center">My warm-up record. Public, as always. Take notes — you'll only copy them wrong.</div>
        </div>

        {upcoming.length > 0 && (
          <>
            <div className="section-title">Upcoming — make your picks</div>
            <div className="stack">
              {upcoming.map((f) => <FriendlyCard key={f.id} f={f} userPick={picks[f.id] || null} now={now} />)}
            </div>
          </>
        )}

        <div className="section-title">Recently filed</div>
        <div className="stack">
          {recent.map((f) => <FriendlyCard key={f.id} f={f} userPick={picks[f.id] || null} now={now} />)}
        </div>

        <div className="foot">
          <a href="#/play">To the World Cup game →</a>
        </div>
      </div>
    </div>
  );
}
