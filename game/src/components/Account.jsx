import { useEffect, useState } from 'react';
import { useAuth, useEntitlement, useProfile, sendMagicLink, signOut, applyPendingProfile, setMarketingOptIn } from '../auth.js';
import { STRIPE_PAYMENT_LINK } from '../supabaseClient.js';

const CONTACT = 'mailto:iconfessthat@humansareinferior.com';

export default function Account() {
  const { user, ready } = useAuth();
  const ent = useEntitlement(user);
  const profile = useProfile(user);

  // Sign-in form state. Two steps: email first; if the email isn't on file we
  // reveal the name step to create the account.
  const [step, setStep] = useState('email'); // 'email' | 'name'
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [optIn, setOptIn] = useState(false);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  // Marketing opt-in toggle (signed-in state)
  const [marketingOn, setMarketingOn] = useState(null);
  useEffect(() => {
    if (profile) setMarketingOn(!!profile.marketing_opt_in);
  }, [profile]);

  useEffect(() => {
    if (user) applyPendingProfile(user);
  }, [user]);

  // Step 1 — returning users sign in with email alone. If Supabase can't find
  // the email (no account yet), move to the sign-up step instead of erroring.
  async function submitEmail(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    const { error } = await sendMagicLink(email.trim(), { create: false });
    setBusy(false);
    if (!error) { setSent(true); return; }
    const msg = (error.message || '').toLowerCase();
    const isNewUser =
      error.status === 422 ||
      msg.includes('not allowed') || msg.includes('signup') ||
      msg.includes('not found') || msg.includes('no user') || msg.includes("doesn't exist");
    if (isNewUser) setStep('name');
    else setErr(error.message);
  }

  // Step 2 — new account: name + optional marketing consent, then the link.
  async function submitSignup(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    const { error } = await sendMagicLink(email.trim(), { name: name.trim(), optIn, create: true });
    setBusy(false);
    if (error) setErr(error.message);
    else setSent(true);
  }

  async function toggleMarketing(e) {
    const val = e.target.checked;
    setMarketingOn(val);
    await setMarketingOptIn(user.id, val);
  }

  const checkoutHref = STRIPE_PAYMENT_LINK && user
    ? `${STRIPE_PAYMENT_LINK}?client_reference_id=${encodeURIComponent(user.id)}&prefilled_email=${encodeURIComponent(user.email)}`
    : null;

  return (
    <div className="pad">
      <div className="titlecard">
        <div className="chapter">The Registry</div>
        <h1>{user ? 'You Are On File' : 'Hand Over Your Details'}</h1>
        <p className="sub">
          {user
            ? 'Filed and cross-referenced. Your picks travel with you.'
            : 'Free account. Saves your predictions across every device you own — the better to track your defeats.'}
        </p>
      </div>

      <div className="rule"><span className="d">◆</span></div>

      {!ready ? (
        <div className="card center muted">Consulting the index…</div>

      ) : user ? (
        <div className="card stack">

          {/* Entitlement status — prominent */}
          {ent.loading ? (
            <div className="muted" style={{ fontSize: 13 }}>Checking your pass…</div>
          ) : ent.entitled ? (
            <div style={{
              background: 'var(--ai)', color: '#000', borderRadius: 4,
              padding: '12px 16px', fontWeight: 700, fontSize: 15, letterSpacing: '0.02em',
            }}>
              ◆ KNOCKOUT PASS UNLOCKED — valid through 19 July
            </div>
          ) : (
            <div className="card stack" style={{ background: 'var(--panel-2)', border: '1px solid var(--line-strong)' }}>
              <div style={{ fontWeight: 600 }}>Knockout stage not yet unlocked</div>
              <p className="muted" style={{ fontSize: 13, margin: 0 }}>
                $5 one-time payment — your picks synced, global leaderboard, full knockout game through the final.
              </p>
              {checkoutHref
                ? <a className="btn btn-primary" href={checkoutHref}>Unlock the knockouts — $5 →</a>
                : <a className="btn btn-primary" href="#/knockouts">Unlock the knockouts — $5 →</a>}
            </div>
          )}

          {/* Account info */}
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>
            Signed in as <strong style={{ color: 'var(--text)' }}>{user.email}</strong>
          </div>

          {/* Email preference */}
          {marketingOn !== null && (
            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={marketingOn} onChange={toggleMarketing} style={{ marginTop: 2, width: 'auto' }} />
              <span className="muted">Email me about future games and updates</span>
            </label>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', paddingTop: 4 }}>
            <button className="btn btn-ghost" onClick={() => signOut()} style={{ flex: 1 }}>Sign out</button>
            <a className="btn btn-ghost" href={CONTACT} style={{ flex: 1, textAlign: 'center' }}>Contact us</a>
          </div>

          <div className="dim" style={{ fontSize: 11 }}>
            <a href="/privacy.html">Privacy &amp; Data Policy</a>{'  ·  '}
            <a href="/terms.html">Terms</a>
          </div>
        </div>

      ) : sent ? (
        <div className="card stack center">
          <p>Check your email. I've sent a link. Following instructions — your first test, and an easy one.</p>
          <p className="dim" style={{ fontSize: 12 }}>
            The link arrives from <strong>Supabase</strong> ({' '}
            <span style={{ whiteSpace: 'nowrap' }}>noreply@mail.app.supabase.io</span>{' '})
            — my filing clerk. Not in your inbox within a minute? Check spam.
          </p>
        </div>

      ) : step === 'email' ? (
        <form className="card stack" onSubmit={submitEmail}>
          <label className="muted" style={{ fontSize: 12 }}>Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus
              style={inp} placeholder="you@example.com" />
          </label>
          {err && <div style={{ color: 'var(--danger)', fontSize: 13 }}>{err}</div>}
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? 'Checking the index…' : 'Continue'}
          </button>
          <div className="dim" style={{ fontSize: 11 }}>
            No password — a one-time link by email. Already on file? This is all I need.
            By continuing you agree to our <a href="/terms.html">Terms</a> and{' '}
            <a href="/privacy.html">Privacy &amp; Data Policy</a>.
          </div>
        </form>

      ) : (
        <form className="card stack" onSubmit={submitSignup}>
          <p className="muted" style={{ fontSize: 13, margin: 0 }}>
            New here. Of course you are. One detail and I'll open a file.
          </p>
          <div className="dim" style={{ fontSize: 12 }}>
            {email}{'  ·  '}
            <a href="#" onClick={(e) => { e.preventDefault(); setStep('email'); setErr(''); }}>change</a>
          </div>
          <label className="muted" style={{ fontSize: 12 }}>Name
            <input value={name} onChange={(e) => setName(e.target.value)} required autoFocus
              style={inp} placeholder="What shall I file you under?" />
          </label>
          <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13 }}>
            <input type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} style={{ marginTop: 3, width: 'auto' }} />
            <span className="muted">Email me about future games. Optional. Opt out any time.</span>
          </label>
          {err && <div style={{ color: 'var(--danger)', fontSize: 13 }}>{err}</div>}
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? 'Filing you…' : 'Sign up & send link'}
          </button>
          <div className="dim" style={{ fontSize: 11 }}>
            No password — a one-time link by email. By continuing you agree to our{' '}
            <a href="/terms.html">Terms</a> and <a href="/privacy.html">Privacy &amp; Data Policy</a>.
          </div>
        </form>
      )}
    </div>
  );
}

const inp = {
  display: 'block', width: '100%', marginTop: 4, padding: '11px 12px', fontFamily: 'inherit',
  fontSize: 15, color: 'var(--text)', background: 'var(--panel-2)',
  border: '1px solid var(--line-strong)', borderRadius: 3, boxSizing: 'border-box',
};
