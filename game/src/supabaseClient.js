import { createClient } from '@supabase/supabase-js';

// Public, safe-to-ship values: the project URL and the *publishable* key are
// designed to live in the browser — Row-Level Security is what protects the
// data, not key secrecy. Overridable via Vite env if ever rotated.
const url = import.meta.env.VITE_SUPABASE_URL || 'https://ahznwacqwfqariiqmorb.supabase.co';
const key =
  import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_I_sqpL-Q5spPX04t9TuHGQ_MgUdED_g';

export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

// The Stripe Payment Link ($5 one-time). Set once it exists in Stripe; until
// then the upgrade button shows "not yet available".
export const STRIPE_PAYMENT_LINK =
  import.meta.env.VITE_STRIPE_PAYMENT_LINK ||
  'https://buy.stripe.com/14A7sM3R09Jr3cKf2MdAk04';
