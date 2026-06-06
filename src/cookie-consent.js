// Dependency-free cookie-consent banner (UK GDPR / PECR friendly).
//
// Default posture: only strictly-necessary cookies run until the visitor opts
// in. Any future analytics/marketing scripts must call `hasConsent('analytics')`
// before loading, and can re-check after the `cookieconsent:updated` event.
//
// Choice is stored in localStorage. The footer's "Cookie settings" button calls
// window.openCookieSettings() (exposed below) to reopen the banner.

const STORAGE_KEY = 'cookie_consent_v1';
const GOLD = '#f4b942';
const DARK = '#0d1525';

function readChoice() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
}

function saveChoice(choice) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...choice, ts: Date.now() }),
  );
  window.dispatchEvent(new CustomEvent('cookieconsent:updated', { detail: choice }));
}

// Public helper for gating non-essential scripts.
export function hasConsent(category) {
  const c = readChoice();
  return !!(c && c[category]);
}

function removeBanner() {
  const el = document.getElementById('cookie-consent');
  if (el) el.remove();
}

function renderBanner() {
  if (document.getElementById('cookie-consent')) return;

  const wrap = document.createElement('div');
  wrap.id = 'cookie-consent';
  Object.assign(wrap.style, {
    position: 'fixed',
    left: '0',
    right: '0',
    bottom: '0',
    zIndex: '300',
    background: DARK,
    borderTop: `1px solid ${GOLD}`,
    padding: '16px',
    paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
    boxShadow: '0 -6px 24px rgba(0,0,0,0.5)',
  });

  const text = document.createElement('p');
  text.style.cssText =
    'margin:0 0 12px;font-family:Barlow,sans-serif;font-size:13px;line-height:1.5;color:#cbd5e1;';
  text.innerHTML =
    'We use strictly-necessary cookies to run the site and (with your consent) analytics to improve it. ' +
    'See our <a href="/cookies.html" style="color:' +
    GOLD +
    ';text-decoration:underline;">Cookie Policy</a>.';

  const row = document.createElement('div');
  row.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;';

  const mkBtn = (label, primary) => {
    const b = document.createElement('button');
    b.textContent = label;
    b.style.cssText =
      'flex:1;min-width:130px;border-radius:10px;padding:11px 14px;font-family:Barlow,sans-serif;' +
      'font-weight:700;font-size:13px;cursor:pointer;border:1px solid ' +
      (primary ? GOLD : 'rgba(255,255,255,0.2)') +
      ';background:' +
      (primary ? GOLD : 'transparent') +
      ';color:' +
      (primary ? DARK : '#e2e8f0') +
      ';';
    return b;
  };

  const necessary = mkBtn('Necessary only', false);
  const acceptAll = mkBtn('Accept all', true);

  necessary.addEventListener('click', () => {
    saveChoice({ necessary: true, analytics: false });
    removeBanner();
  });
  acceptAll.addEventListener('click', () => {
    saveChoice({ necessary: true, analytics: true });
    removeBanner();
  });

  row.append(necessary, acceptAll);
  wrap.append(text, row);
  document.body.appendChild(wrap);
}

export function setupCookieConsent() {
  // Let the footer reopen the banner at any time.
  window.openCookieSettings = renderBanner;
  if (!readChoice()) renderBanner();
}
