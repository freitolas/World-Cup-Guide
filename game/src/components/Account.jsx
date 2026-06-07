import { useEffect, useState } from 'react';
import AiMark from './AiMark.jsx';
import { useAuth, sendMagicLink, signOut, applyPendingProfile } from '../auth.js';

export default function Account() {
  const { user, ready } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [optIn, setOptIn] = useState(false); // opt-IN: unticked by default (UK PECR)
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState('');

  // Once signed in, persist the pending name + consent to the profile.
  useEffect(() => {
    if (user) applyPendingProfile(user);
  }, [user]);

  async function submit(e) {
    e.preventDefault();
    setErr('');
    const { error } = await sendMagicLink(email.trim(), name.trim(), optIn);
    if (error) setErr(error.message);
    else setSent(true);
  }

  return (
    <div className="pad">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="#/" className="dim" style={{ fontSize: 12 }}>← home</a>
        <AiMark />
      </div>

      <div className="titlecard">
        <div className="chapter">The Registry</div>
        <h1>{user ? 'You Are On File' : 'Hand Over Your Details'}</h1>
        <p className="sub">
          {user
            ? 'Filed and cross-referenced. Now I can beat you on every device you own.'
            : 'A name and an email. I keep your picks safe across devices — the better to track your defeats.'}
        </p>
      </div>

      <div className="rule"><span className="d">◆</span></div>

      {!ready ? (
        <div className="card center muted">Consulting the index…</div>
      ) : user ? (
        <div className="card stack">
          <div><span className="muted">Signed in as</span><br /><strong>{user.email}</strong></div>
          <a className="btn btn-primary" href="#/knockouts">Go to the knockout pass →</a>
          <button className="btn btn-ghost" onClick={() => signOut()}>Sign out</button>
        </div>
      ) : sent ? (
        <div className="card center">
          <p>Check your email. I've sent a link. Following instructions — your first test, and an easy one.</p>
        </div>
      ) : (
        <form className="card stack" onSubmit={submit}>
          <label className="muted" style={{ fontSize: 12 }}>Name
            <input value={name} onChange={(e) => setName(e.target.value)} required
              style={inp} placeholder="What shall I file you under?" />
          </label>
          <label className="muted" style={{ fontSize: 12 }}>Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              style={inp} placeholder="you@example.com" />
          </label>
          <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13 }}>
            <input type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} style={{ marginTop: 3 }} />
            <span className="muted">Email me about future games. Optional. You can opt out anytime.</span>
          </label>
          {err && <div style={{ color: 'var(--danger)', fontSize: 13 }}>{err}</div>}
          <button className="btn btn-primary" type="submit">Send me a sign-in link</button>
          <div className="dim" style={{ fontSize: 11 }}>
            No password — we email you a one-time link. By continuing you agree to our{' '}
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
