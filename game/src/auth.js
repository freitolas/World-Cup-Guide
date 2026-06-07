import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient.js';

// Current auth session (passwordless / magic-link).
export function useAuth() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);
  return { session, user: session?.user ?? null, ready };
}

// Send a passwordless sign-in link. Name + marketing consent are stashed locally
// and written to the profile once the link is followed and the session exists.
export async function sendMagicLink(email, name, optIn) {
  localStorage.setItem('hai_pending_profile', JSON.stringify({ name, optIn }));
  // Redirect to origin root (no hash) so Supabase can find the ?code= param
  // in window.location.search. Hash-based routes swallow query params.
  return supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${window.location.origin}/` },
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

// After auth completes, persist any pending profile (name + opt-IN consent).
export async function applyPendingProfile(user) {
  const raw = localStorage.getItem('hai_pending_profile');
  if (!raw || !user) return;
  try {
    const { name, optIn } = JSON.parse(raw);
    await supabase.from('profiles').upsert({
      id: user.id,
      display_name: name || null,
      marketing_opt_in: !!optIn,
      consent_at: optIn ? new Date().toISOString() : null,
    });
    localStorage.removeItem('hai_pending_profile');
  } catch {
    /* ignore */
  }
}

// Read the user's profile (name + marketing consent).
export function useProfile(user) {
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    if (!user) { setProfile(null); return; }
    supabase.from('profiles').select('display_name,marketing_opt_in').eq('id', user.id).maybeSingle()
      .then(({ data }) => setProfile(data));
  }, [user?.id]);
  return profile;
}

export async function setMarketingOptIn(userId, value) {
  return supabase.from('profiles').upsert({ id: userId, marketing_opt_in: !!value });
}

// Live entitlement for the current user (paid pass valid while not expired).
export function useEntitlement(user) {
  const [state, setState] = useState({ loading: true, entitled: false, expiresAt: null });
  useEffect(() => {
    let active = true;
    if (!user) {
      setState({ loading: false, entitled: false, expiresAt: null });
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    supabase
      .from('entitlements')
      .select('expires_at')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        const exp = data?.expires_at ? new Date(data.expires_at) : null;
        setState({ loading: false, entitled: !!exp && exp.getTime() > Date.now(), expiresAt: exp });
      });
    return () => {
      active = false;
    };
  }, [user?.id]);
  return state;
}
