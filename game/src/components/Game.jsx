import { useMemo } from 'react';
import Scoreboard from './Scoreboard.jsx';
import MatchCard from './MatchCard.jsx';
import AiMark from './AiMark.jsx';
import { DeviceNudge, UpgradeNudge } from './Nudges.jsx';
import { groupMatches, matchesByDate, results, botPicks, kickoff } from '../data.js';
import { tally } from '../scoring.js';
import { usePicks, useNow } from '../hooks.js';
import { getStartedAt } from '../storage.js';

const dateLabel = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString(undefined, {
    weekday: 'long', month: 'short', day: 'numeric',
  });

// Fixtures-first home. Teams/players are reached by tapping a team in a card —
// not via top-level tabs (brief §6).
export default function Game() {
  const picks = usePicks();
  const now = useNow();
  // Only matches kicking off after the player arrived count toward the duel —
  // no forfeits for games that finished before they started playing.
  const t = useMemo(() => {
    const startedAt = getStartedAt();
    const scope = groupMatches.filter((m) => kickoff(m).getTime() >= startedAt);
    return tally(scope, picks, results, botPicks);
  }, [picks]); // eslint-disable-line react-hooks/exhaustive-deps
  const byDate = matchesByDate();
  const madeAnyPick = Object.keys(picks).length > 0;

  return (
    <div>
      <Scoreboard tally={t} />
      <div className="pad">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <AiMark />
          <span style={{ display: 'flex', gap: 12, fontSize: 12 }}>
            <a href="#/warmups" className="dim">warm-ups</a>
            <a href="#/knockouts" className="dim">$5 pass</a>
            <a href="#/account" className="dim">account</a>
          </span>
        </div>

        <div style={{ marginTop: 12 }}>
          <DeviceNudge show={madeAnyPick} />
        </div>

        {byDate.map(([date, ms], i) => (
          <div key={date}>
            <div className="section-title">{i === 0 ? `Next up · ${dateLabel(date)}` : dateLabel(date)}</div>
            <div className="stack">
              {ms.map((m) => (
                <MatchCard key={m.id} match={m} userPick={picks[m.id] || null} now={now} />
              ))}
            </div>
          </div>
        ))}

        <div style={{ marginTop: 22 }}>
          <UpgradeNudge />
        </div>
      </div>
    </div>
  );
}
