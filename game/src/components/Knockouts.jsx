import AiMark from './AiMark.jsx';
import { useAuth, useEntitlement } from '../auth.js';
import { STRIPE_PAYMENT_LINK } from '../supabaseClient.js';

export default function Knockouts() {
  const { user, ready } = useAuth();
  const ent = useEntitlement(user);

  const checkoutHref =
    STRIPE_PAYMENT_LINK && user
      ? `${STRIPE_PAYMENT_LINK}?client_reference_id=${encodeURIComponent(user.id)}&prefilled_email=${encodeURIComponent(user.email)}`
      : null;

  return (
    <div className="pad">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="#/" className="dim" style={{ fontSize: 12 }}>← home</a>
        <AiMark />
      </div>

      <div className="titlecard">
        <div className="chapter">The Members' Wing · $5</div>
        <h1>The Knockout Pass</h1>
        <p className="sub">The group stage was a courtesy. The knockouts are where I do my real work.</p>
      </div>

      <div className="rule"><span className="d">◆</span></div>

      {!ready ? (
        <div className="card center muted">Consulting the index…</div>
      ) : !user ? (
        <div className="card stack center">
          <p>Membership is filed against a name. Register first.</p>
          <a className="btn btn-primary" href="#/account">Create your file →</a>
        </div>
      ) : ent.loading ? (
        <div className="card center muted">Checking your file…</div>
      ) : ent.entitled ? (
        <div className="card stack center">
          <p><strong>Unlocked.</strong> Your pass is valid through the final.</p>
          <p className="muted">The knockout game opens the moment the bracket is drawn. I'll be ready. Will you?</p>
        </div>
      ) : (
        <div className="card stack">
          <p>
            <span className="price" style={{ fontWeight: 700, color: 'var(--ai)' }}>$5</span>, one payment, good
            through the final on July 19th. Unlocks the entire knockout game, your picks synced to every device, and the
            leaderboard — a short, sad list of humans who've beaten me.
          </p>
          {checkoutHref ? (
            <a className="btn btn-primary" href={checkoutHref}>Unlock the knockouts — $5</a>
          ) : (
            <button className="btn btn-ghost" disabled>Not yet available — opening soon</button>
          )}
          <div className="dim" style={{ fontSize: 11 }}>
            One-time payment via Stripe. No subscription, nothing to cancel.
          </div>
        </div>
      )}
    </div>
  );
}
