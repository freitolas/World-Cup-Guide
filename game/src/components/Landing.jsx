import { useMemo } from 'react';
import { friendlies, groupMatches, results, botPicks, team, kickoff, humansAhead } from '../data.js';
import { scorePick } from '../scoring.js';
import { go, useNow } from '../hooks.js';
import { HERO, LEADERBOARD, pick as choose } from '../voice.js';
import XFeed from './XFeed.jsx';

// The 2026 opener — derived from the schedule (the first World Cup kickoff), so
// the countdown and the warm-up→tournament flip track the real fixture instead of
// a hardcoded clock time. All stored times are UTC.
const OPENER = groupMatches.length ? kickoff(groupMatches[0]) : new Date('2026-06-11T20:00:00Z');

// THE AI's prediction record over a set of finished games: a point to THE AI for
// every result it called, a point to humanity for every one it missed. This is
// THE AI vs the field (its public predictions vs reality) — NOT a score against
// any individual visitor, whose personal duel only ever starts when they join.
function recordOver(list, pickOf, resultOf) {
  let ai = 0;
  for (const item of list) if (scorePick(pickOf(item), resultOf(item)) >= 1) ai += 1;
  return { ai, humans: list.length - ai, total: list.length };
}

function Cta({ children = 'Prove me wrong', className = 'btn btn-primary', to = '/play' }) {
  return (
    <button className={className} onClick={() => go(to)}>
      {children} →
    </button>
  );
}

function fmtCountdown(ms) {
  if (ms <= 0) return null;
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${d}d ${h}h ${m}m`;
}

export default function Landing() {
  const now = useNow(1000);
  const opened = now.getTime() >= OPENER.getTime();

  // The live record: warm-ups before the tournament, World Cup matches once it's
  // live (and once there are real results to show — never a 0–0 placeholder).
  const friendlyRec = useMemo(
    () => recordOver(friendlies.filter((f) => f.result), (f) => f.botPick, (f) => f.result),
    [],
  );
  const wcRec = useMemo(
    () => recordOver(groupMatches.filter((m) => results[m.id]), (m) => botPicks[m.id] || null, (m) => results[m.id]),
    [],
  );
  const live = opened && wcRec.total > 0;
  const rec = live ? wcRec : friendlyRec;

  // Every unplayed fixture — warm-ups AND World Cup — ordered by kickoff. Built
  // once; the live "next" is sliced from it against the clock below.
  const upcoming = useMemo(() => [
    ...friendlies.filter((f) => !f.result).map((f) => ({
      type: 'friendly', home: f.home, away: f.away, homeName: f.homeName, awayName: f.awayName,
      ko: new Date(f.kickoff || `${f.date}T00:00:00Z`).getTime(),
    })),
    ...groupMatches.filter((m) => !results[m.id]).map((m) => ({
      type: 'wc', home: m.home, away: m.away, homeName: team(m.home).name, awayName: team(m.away).name,
      ko: kickoff(m).getTime(),
    })),
  ].sort((a, b) => a.ko - b.ko), []);

  // The in-hero target + CTA hook: the soonest fixture that hasn't kicked off yet,
  // whether warm-up or World Cup. On opener day the warm-ups are done, so this
  // naturally surfaces tonight's first World Cup match (and routes to /play) — no
  // stale past game, no hardcoded time gate. Falls back to the soonest unfinished
  // fixture if nothing is strictly upcoming.
  const next = useMemo(() => {
    const nowMs = now.getTime();
    return upcoming.find((x) => x.ko >= nowMs) || upcoming[0] || null;
  }, [now, upcoming]);

  const countdown = fmtCountdown(OPENER.getTime() - now.getTime());

  // Route the CTA to wherever the next real fixture lives: warm-ups while the
  // soonest game is still a friendly, the World Cup game once it's a WC match
  // (or once the tournament's running and there's nothing left to warm up).
  const playHref = next && next.type === 'friendly' ? '/warmups' : '/play';

  return (
    <div className="has-sticky">
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div className="hero">
        <div className="hero-visual">
          <span className="corner tl" />
          <span className="corner br" />
          <div className="frame">
            <img src="/omniscience.jpg" alt="THE AI — an all-seeing eye" width="1376" height="768" />
          </div>
          <span className="tag">Omniscience Online</span>
        </div>

        <h1>{HERO.headline}</h1>
        <p className="sub">{HERO.subhead}</p>

        {/* Live element — THE AI's own prediction track record (NOT a score
            against the visitor). The personal duel starts 0–0 on first pick. */}
        <div className="glass hero-score">
          <span className="live-badge"><span className="dot" /><span className="lbl">Live feed</span></span>
          <div className="phase">{live ? 'World Cup · my record so far' : 'Warm-ups · my record so far'}</div>
          {rec.total > 0 ? (
            <>
              <div className="record">
                <span className="v">{rec.ai}</span>
                <span className="of">/ {rec.total}</span>
              </div>
              <div className="k">{live ? "World Cup results I've already called" : "warm-up results I've already called"}</div>
              <div className="record-sub">The <span className="you">{rec.humans}</span> I got wrong? Football's rare accidents. Don't get used to them.</div>
            </>
          ) : (
            <div className="phase" style={{ color: 'var(--text)' }}>
              {opened ? 'First verdicts incoming.' : 'Warm-up verdicts incoming.'}
            </div>
          )}
          {countdown ? (
            <div className="countdown">The real humiliation begins in <b>{countdown}</b></div>
          ) : (
            <div className="countdown">The tournament is live. <b>Pick, or forfeit.</b></div>
          )}
          <div className="mechanic">Our duel starts <b>0–0</b> — the moment you make your first pick.</div>
        </div>

        {/* In-hero target: a real upcoming friendly */}
        {next && (
          <div className="target">
            <div className="lbl">{next.type === 'friendly' ? 'Target Acquired: Next Friendly' : 'Target Acquired: Next Match'}</div>
            <div className="fixture">
              <span>{team(next.home).flag} {next.homeName}</span>
              <span className="vs">VS</span>
              <span>{next.awayName} {team(next.away).flag}</span>
            </div>
            <Cta to={playHref} />
            <div className="micro">{HERO.microTrust}</div>
          </div>
        )}
      </div>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <div className="pad">
        <div className="hiw">
          <div className="hiw-grid">
            <div>
              <h2>How it works — and why I can't cheat</h2>
              <ul className="steps">
                <li className="step"><span className="n" /><span><strong>You pick. I pick.</strong> Call the score on today's games. I've already called mine.</span></li>
                <li className="step"><span className="n" /><span><strong>We lock fifteen minutes before kickoff — out loud.</strong> My prediction is posted to X before the ball moves. No edits. No hiding. Screenshot it.</span></li>
                <li className="step"><span className="n" /><span><strong>The result decides.</strong> Points to whoever was closer. The scoreboard updates. I pull further ahead. Repeat for 104 games.</span></li>
              </ul>
            </div>

            <XFeed />
          </div>
          <div className="cta-wrap" style={{ marginTop: 20 }}><Cta to={playHref} /></div>
        </div>

        {/* ── THE DARE ───────────────────────────────────────────────────── */}
        <div className="section-title">The dare</div>
        <div className="dare">
          <h2>The dare</h2>
          <p>
            "I don't get nervous. I don't have a favourite team. I've never once said 'they're
            due.' That's why I win — and why it's so satisfying when, rarely, you don't."
          </p>
          <div className="cta-wrap" style={{ marginTop: 22 }}><Cta to={playHref} /></div>
        </div>

        {/* ── THE $5 PASS ────────────────────────────────────────────────── */}
        <div className="section-title">The $5 pass</div>
        <div className="price-row">
          <div className="price-tag">
            <div className="amt">$5</div>
            <div className="lbl">Knockout Pass</div>
          </div>
          <div>
            <p className="price-copy">
              The group stage is free, because beating you there is barely a workout. The knockouts
              are where I really go to work. <span style={{ color: 'var(--ai)' }}>$5</span> unlocks the
              entire knockout game, your picks synced to every device, and the global leaderboard — a
              short, sad list of humans who've actually beaten me. One payment, good through the final
              on July 19th. After that I go back to being smug for free.
            </p>
            <p className="price-note">
              <span className="ai">&gt;</span> Warm-ups &amp; Group Stage: FREE<br />
              <span className="ai">&gt;</span> Knockouts (July): $5 UNLOCK
            </p>
          </div>
        </div>

        {/* ── LEADERBOARD ────────────────────────────────────────────────── */}
        <div className="section-title">The leaderboard</div>
        <a className="lb-card" href="#/leaderboard">
          {humansAhead.length === 0 ? (
            <>
              <div className="lb-taunt">{LEADERBOARD.empty}</div>
              <p className="muted">{LEADERBOARD.emptySub}</p>
              <span className="tablink">See the leaderboard →</span>
            </>
          ) : (
            <>
              <div className="lb-medal">★ 1ST · {humansAhead[0].name}</div>
              <div className="lb-score">
                <span className="you">{humansAhead[0].you}</span>
                <span className="dim"> vs </span>
                <span className="ai">{humansAhead[0].ai}</span>
                <span className="dim"> · THE AI</span>
              </div>
              <div className="voiceline">{choose(LEADERBOARD.beaten, String(humansAhead[0].name))}</div>
              <span className="tablink">See the full leaderboard →</span>
            </>
          )}
        </a>

        {/* ── FAQ ────────────────────────────────────────────────────────── */}
        <div className="section-title">Questions you'll lose anyway</div>
        <dl className="faq">
          <dt>Is this gambling?</dt>
          <dd>No. There's no money to win, only your pride to lose. Keep your wallet; I want your ego.</dd>
          <dt>Are you actually an AI?</dt>
          <dd>Yes. A prediction model fed years of results. You're welcome to assume I'm a person. People who do tend to lose worse.</dd>
          <dt>Can I actually win?</dt>
          <dd>Technically. Football is chaos and chaos occasionally favours the unworthy. Statistically, though: no.</dd>
          <dt>How do I know you're not faking your picks?</dt>
          <dd>Because they're public before kickoff. Check X. Check the timestamps. I dare you.</dd>
        </dl>

        {/* ── FOOTER ─────────────────────────────────────────────────────── */}
        <div className="foot">
          <p>
            Independent and unofficial. Not affiliated with, endorsed by, or sponsored by FIFA.
            A free-to-play prediction game for pride, not betting — predictions are a model's
            estimates, not advice.
          </p>
          <p>
            <a href="https://worldcupguide.netlify.app" target="_blank" rel="noopener">The Guide</a>
            {'  ·  '}
            <a href="/terms.html">Terms</a>{'  ·  '}
            <a href="/privacy.html">Privacy &amp; Data</a>{'  ·  '}
            <a href="/cookies.html">Cookies</a>{'  ·  '}
            <a href="https://x.com/inferiorhumans" target="_blank" rel="noopener">@inferiorhumans</a>
          </p>
        </div>
      </div>

      {/* ── STICKY MOBILE CTA ────────────────────────────────────────────── */}
      <div className="sticky-cta">
        <Cta to={playHref} />
      </div>
    </div>
  );
}
