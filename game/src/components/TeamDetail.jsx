import { team, playersByTeam, groupMatches, teamById } from '../data.js';
import { ERRORS, OMNISCIENCE, pick as choose } from '../voice.js';
import { go } from '../hooks.js';

export default function TeamDetail({ id }) {
  const t = teamById[id];
  if (!t) {
    return (
      <div className="pad">
        <p className="voiceline">{ERRORS.notFound}</p>
        <button className="btn btn-primary" onClick={() => go('/play')}>Back to the games</button>
      </div>
    );
  }

  const squad = playersByTeam[id] || [];
  const fixtures = groupMatches.filter((m) => m.home === id || m.away === id);

  return (
    <div className="pad stack">
      <a href="#/play" className="dim mono" style={{ fontSize: 12 }}>← fixtures</a>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 44 }}>{t.flag}</span>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{t.name}</div>
            <div className="muted" style={{ fontSize: 13 }}>
              {[t.nickname, t.group && `Group ${t.group}`, t.rank && `FIFA #${t.rank}`].filter(Boolean).join(' · ')}
            </div>
          </div>
        </div>
        {t.coach && <div className="muted" style={{ marginTop: 10, fontSize: 13 }}>Coach: {t.coach}</div>}
        {t.history && <div style={{ marginTop: 8, fontSize: 14 }}>{t.history}</div>}
        <div className="voiceline">{choose(OMNISCIENCE, id)}</div>
      </div>

      {fixtures.length > 0 && (
        <div>
          <div className="section-title">Fixtures</div>
          <div className="stack">
            {fixtures.map((m) => {
              const opp = team(m.home === id ? m.away : m.home);
              return (
                <div key={m.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{m.home === id ? 'vs' : 'at'} {opp.flag} {opp.name}</span>
                  <span className="dim mono" style={{ fontSize: 12 }}>{m.date}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {squad.length > 0 && (
        <div>
          <div className="section-title">Squad ({squad.length})</div>
          <div className="card stack">
            {squad.map((p) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span>{p.name}</span>
                <span className="dim" style={{ fontSize: 12 }}>{[p.pos, p.club].filter(Boolean).join(' · ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button className="btn btn-primary" onClick={() => go('/play')}>Back to the games — make your picks</button>
    </div>
  );
}
