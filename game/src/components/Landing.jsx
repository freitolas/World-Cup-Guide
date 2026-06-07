import { useMemo } from 'react';
import { friendlies, groupMatches, results, botPicks, team, kickoff } from '../data.js';
import { scorePick } from '../scoring.js';
import { go, useNow } from '../hooks.js';
import { HERO, TRUST, pick as choose } from '../voice.js';
import XFeed from './XFeed.jsx';

// The 2026 opener. The countdown to "the real humiliation".
const OPENER = new Date('2026-06-11T16:00:00Z');

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

  // Next real fixture — the in-hero target + CTA hook. Friendly before the
  // opener, World Cup match after.
  const next = useMemo(() => {
    if (opened) {
      const m = groupMatches.filter((x) => !results[x.id]).sort((a, b) => kickoff(a) - kickoff(b))[0];
      return m ? { home: m.home, away: m.away, homeName: team(m.home).name, awayName: team(m.away).name } : null;
    }
    const f = friendlies.filter((x) => !x.result).sort((a, b) => String(a.kickoff).localeCompare(String(b.kickoff)))[0];
    return f ? { home: f.home, away: f.away, homeName: f.homeName, awayName: f.awayName } : null;
  }, [opened]);

  const countdown = fmtCountdown(OPENER.getTime() - now.getTime());

  // Before the opener the only real, playable games are the warm-up friendlies —
  // so every CTA points there. It flips to the World Cup game once it kicks off.
  const playHref = opened ? '/play' : '/warmups';

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
            <div className="lbl">{opened ? 'Target Acquired: Next Match' : 'Target Acquired: Next Friendly'}</div>
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
                <li className="step"><span className="n" /><span><strong>We lock at kickoff — out loud.</strong> My prediction goes public before the ball moves. No edits. No hiding. I even post it on X so you can screenshot it.</span></li>
                <li className="step"><span className="n" /><span><strong>The result decides.</strong> Points to whoever was closer. The scoreboard updates. I pull further ahead. Repeat for 104 games.</span></li>
              </ul>
            </div>

            <div className="receipt">
              <div className="head">system@the-ai:~$ cat proof.log</div>
              <div className="line"><span className="t">[18:45:02 UTC]</span> &gt; MATCH: FRA vs GER</div>
              <div className="line"><span className="t">[18:45:03 UTC]</span> &gt; AI_PREDICTION: FRA 2 - 1 GER</div>
              <div className="line"><span className="t">[18:45:05 UTC]</span> &gt; POSTING TO X...</div>
              <div className="quote">{choose(TRUST, 'landing')}</div>
              <div className="line"><span className="t">[18:45:06 UTC]</span> &gt; LOCK SECURED.</div>
            </div>
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

        {/* ── LIVE FROM X — real recent picks, styled as a feed ───────────── */}
        <div className="section-title">Live from @inferiorhumans</div>
        <XFeed />

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
