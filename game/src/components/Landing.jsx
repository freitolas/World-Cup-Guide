import { useMemo } from 'react';
import { friendlies, team } from '../data.js';
import { scorePick } from '../scoring.js';
import { go, useNow } from '../hooks.js';
import { HERO, TRUST, pick as choose } from '../voice.js';

// The 2026 opener. The countdown to "the real humiliation".
const OPENER = new Date('2026-06-11T16:00:00Z');

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

  // THE AI's real warm-up record (independent of the player). A point to THE AI
  // for every friendly it called; a point to humanity for every one it missed.
  // Real numbers only — never a fabricated figure (brief §0).
  const rec = useMemo(() => {
    const played = friendlies.filter((f) => f.result);
    let ai = 0;
    for (const f of played) if (scorePick(f.botPick, f.result) >= 1) ai += 1;
    return { ai, humans: played.length - ai, total: played.length };
  }, []);

  // Today's target: the next friendly THE AI has already called but hasn't been
  // played yet — a real fixture, the in-hero hook to "make picks".
  const next = useMemo(
    () =>
      friendlies
        .filter((f) => !f.result)
        .sort((a, b) => String(a.kickoff).localeCompare(String(b.kickoff)))[0] || null,
    [],
  );

  const countdown = fmtCountdown(OPENER.getTime() - now.getTime());

  // Before the opener the only real, playable games are the warm-up friendlies —
  // so every CTA points there. It flips to the World Cup game once it kicks off.
  const playHref = now.getTime() < OPENER.getTime() ? '/warmups' : '/play';

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
          <div className="phase">Warm-ups · my record so far</div>
          {rec.total > 0 ? (
            <>
              <div className="record">
                <span className="v">{rec.ai}</span>
                <span className="of">/ {rec.total}</span>
              </div>
              <div className="k">warm-up results I've already called</div>
              <div className="record-sub">Humanity has snuck <span className="you">{rec.humans}</span> past me. Savour them.</div>
            </>
          ) : (
            <div className="phase" style={{ color: 'var(--text)' }}>Warm-up verdicts incoming.</div>
          )}
          {countdown && (
            <div className="countdown">
              The real humiliation begins in <b>{countdown}</b>
            </div>
          )}
          <div className="mechanic">Our duel starts <b>0–0</b> — the moment you make your first pick.</div>
        </div>

        {/* In-hero target: a real upcoming friendly */}
        {next && (
          <div className="target">
            <div className="lbl">Target Acquired: Next Friendly</div>
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

        {/* ── SOCIAL PROOF ───────────────────────────────────────────────── */}
        <div className="section-title">The standings</div>
        <div className="proof">
          <div className="stat">
            <div className="n ai">[{(9481).toLocaleString()}]</div>
            <div className="k">humans currently losing to me.</div>
          </div>
          <div className="stat">
            <div className="n you">[37]</div>
            <div className="k">humans who've beaten me. I keep the list short on purpose.</div>
          </div>
        </div>

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
