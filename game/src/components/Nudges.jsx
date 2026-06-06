import { NUDGE } from '../voice.js';

// The two required nudges. Device-only warning appears once a pick exists; the
// $5 upgrade is always offered (knockout game is the paid M2 unlock).
export function DeviceNudge({ show }) {
  if (!show) return null;
  return (
    <div className="nudge">
      <span className="ttl">Saved on this device only.</span>
      {NUDGE.device}
    </div>
  );
}

export function UpgradeNudge() {
  return (
    <div className="nudge upgrade">
      <span className="ttl">
        Unlock the knockouts — <span className="price">$5</span>, good through the final
      </span>
      {NUDGE.upgrade}
      <div className="dim" style={{ marginTop: 6, fontSize: 12 }}>
        Coming soon — one-time payment, no subscription. (Not yet available.)
      </div>
    </div>
  );
}
