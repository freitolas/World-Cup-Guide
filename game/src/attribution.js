// First-party, first-touch marketing attribution — no third-party scripts, no
// cookies. On first visit we record where the visitor came from (utm_* params +
// referrer); at signup it's written to the user's Supabase profile, so leads and
// conversions can be attributed to a source/campaign/post (e.g. the X picks).
//
// First-touch with campaign priority: a real campaign (utm_source) wins over a
// plain direct/referrer first touch, but we never overwrite an existing campaign.
const KEY = 'hai_attribution';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

export function getAttribution() {
  try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; }
}

export function captureAttribution() {
  try {
    const params = new URLSearchParams(window.location.search);
    const utm = {};
    for (const k of UTM_KEYS) { const v = params.get(k); if (v) utm[k] = v.slice(0, 120); }
    const hasCampaign = !!utm.utm_source;

    const existing = getAttribution();
    if (existing) {
      // Keep an existing campaign; only upgrade a plain first touch to a campaign.
      if (existing.utm_source || !hasCampaign) return;
    }

    const ref = document.referrer || null;
    localStorage.setItem(KEY, JSON.stringify({
      ...utm,
      referrer: ref,
      landing: window.location.pathname + window.location.search,
      captured_at: new Date().toISOString(),
    }));
  } catch {
    /* storage unavailable — skip silently */
  }
}
