import { useMemo } from 'react';
import AiMark from './AiMark.jsx';
import { groupMatches, results, botPicks } from '../data.js';
import { tally } from '../scoring.js';
import { usePicks, go } from '../hooks.js';
import { HERO, TRUST, NAME, pick as choose } from '../voice.js';

function Cta({ children = HERO.cta }) {
  return (
    <button className="btn btn-primary" onClick={() => go('/play')}>
      {children} →
    </button>
  );
}

export default function Landing() {
  const picks = usePicks();
  const t = useMemo(() => tally(groupMatches, picks, results, botPicks), [picks]);

  return (
    <div>
      {/* ABOVE THE FOLD */}
      <div className="hero">
        {/* Utility nav */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginBottom: 12 }}>
          <a className="tablink" href="#/warmups" style={{ fontSize: 12 }}>Warm-ups</a>
          <a className="tablink" href="#/knockouts" style={{ fontSize: 12 }}>Knockouts — $5</a>
          <a className="tablink" href="#/account" style={{ fontSize: 12 }}>Account</a>
        </div>
        <AiMark />
        <h1>{HERO.headline}</h1>
        <p className="sub">{HERO.subhead}</p>

        {/* Hero = the duel. Real numbers only; pre-tournament it's an honest 0–0. */}
        <div className="duel" role="figure" aria-label="You versus THE AI">
          <span className="side you">
            <div className="lbl">You</div>
            <div className="big">{t.you}</div>
          </span>
          <span className="vs">vs</span>
          <span className="side ai">
            <div className="lbl">{NAME}</div>
            <div className="big">{t.ai}</div>
          </span>
        </div>
        <div className="micro" style={{ marginBottom: 18 }}>
          {t.played > 0 ? `${t.played} matches scored so far` : 'Ten million simulations run. Yours: zero.'}
        </div>

        <Cta />
        <div className="micro">{HERO.microTrust}</div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a className="tablink" href="#/account">Create an account — save your picks →</a>
          <a className="tablink" href="#/warmups">See THE AI's warm-up record →</a>
        </div>
      </div>

      {/* BELOW THE FOLD */}
      <div className="pad">
        <div className="section-title">How it works — and why I can't cheat</div>
        <div className="steps">
          <div className="step"><span className="n" /><span><strong>You pick. I pick.</strong> Call the score on today's games. I've already called mine.</span></div>
          <div className="step"><span className="n" /><span><strong>We lock at kickoff — out loud.</strong> My prediction goes public before the ball moves. No edits. No hiding. I even post it on X so you can screenshot it.</span></div>
          <div className="step"><span className="n" /><span><strong>The result decides.</strong> Points to whoever was closer. The scoreboard updates. I pull further ahead. Repeat for 104 games.</span></div>
        </div>
        <div className="pullquote">{choose(TRUST, 'landing')}</div>
        <Cta>{HERO.cta}</Cta>

        <div className="section-title">The dare</div>
        <p className="muted">
          I don't get nervous. I don't have a favourite team. I've never once said "they're due."
          That's why I win — and why it's so satisfying when, rarely, you don't.
        </p>

        <div className="section-title">The $5 pass</div>
        <p className="muted">
          The group stage is free, because beating you there is barely a workout. The knockouts are
          where I really go to work. <span style={{ color: 'var(--ai)' }}>$5</span> unlocks the entire
          knockout game, your picks synced to every device, and the global leaderboard — a short, sad
          list of humans who've actually beaten me. One payment, good through the final on July 19th.
          After that I go back to being smug for free.
        </p>

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

        <div className="foot">
          <p>
            Independent and unofficial. Not affiliated with, endorsed by, or sponsored by FIFA.
            A free-to-play prediction game for pride, not betting — predictions are a model's
            estimates, not advice.
          </p>
          <p>
            <a href="/terms.html">Terms</a>{'  ·  '}
            <a href="/privacy.html">Privacy &amp; Data</a>{'  ·  '}
            <a href="/cookies.html">Cookies</a>
          </p>
          <p>
            <a href="https://worldcupguide.netlify.app" target="_blank" rel="noopener">The Guide</a>
            {'  ·  '}
            <a href="https://x.com/inferiorhumans" target="_blank" rel="noopener">@inferiorhumans</a>
          </p>
        </div>
      </div>
    </div>
  );
}
