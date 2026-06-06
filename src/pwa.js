// PWA glue: registers the service worker and offers an "install / add to home
// screen" affordance. Dependency-free and self-contained (creates its own DOM).

const GOLD = '#f4b942';
const DARK = '#0d1525';

// --- Service worker registration -------------------------------------------
export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* registration is best-effort; ignore failures */
    });
  });
}

// --- Install affordance -----------------------------------------------------
function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function showAndroidInstallButton(deferredPrompt) {
  if (document.getElementById('pwa-install-btn')) return;
  const btn = document.createElement('button');
  btn.id = 'pwa-install-btn';
  btn.textContent = '⬇ Install app';
  Object.assign(btn.style, {
    position: 'fixed',
    right: '16px',
    bottom: '76px',
    zIndex: '200',
    background: GOLD,
    color: DARK,
    border: 'none',
    borderRadius: '999px',
    padding: '10px 16px',
    fontFamily: 'Barlow, sans-serif',
    fontWeight: '700',
    fontSize: '13px',
    boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
    cursor: 'pointer',
  });
  btn.addEventListener('click', async () => {
    btn.remove();
    deferredPrompt.prompt();
    try {
      await deferredPrompt.userChoice;
    } catch {
      /* ignore */
    }
  });
  document.body.appendChild(btn);
}

function showIosHint() {
  if (localStorage.getItem('pwa_ios_hint_dismissed') === '1') return;
  if (document.getElementById('pwa-ios-hint')) return;
  const bar = document.createElement('div');
  bar.id = 'pwa-ios-hint';
  Object.assign(bar.style, {
    position: 'fixed',
    left: '12px',
    right: '12px',
    bottom: '76px',
    zIndex: '200',
    background: DARK,
    color: '#e2e8f0',
    border: `1px solid ${GOLD}`,
    borderRadius: '12px',
    padding: '12px 14px',
    fontFamily: 'Barlow, sans-serif',
    fontSize: '13px',
    lineHeight: '1.5',
    boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    justifyContent: 'space-between',
  });
  const text = document.createElement('span');
  text.innerHTML = 'Install: tap <strong>Share</strong> then <strong>Add to Home Screen</strong>.';
  const close = document.createElement('button');
  close.textContent = '✕';
  Object.assign(close.style, {
    background: 'none',
    border: 'none',
    color: GOLD,
    fontSize: '16px',
    cursor: 'pointer',
    flexShrink: '0',
  });
  close.addEventListener('click', () => {
    localStorage.setItem('pwa_ios_hint_dismissed', '1');
    bar.remove();
  });
  bar.append(text, close);
  document.body.appendChild(bar);
}

export function setupInstallPrompt() {
  if (isStandalone()) return; // already installed

  // Android / desktop Chrome: capture the native prompt and surface a button.
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    showAndroidInstallButton(e);
  });

  // iOS Safari has no beforeinstallprompt — show a manual hint instead.
  if (isIos()) {
    window.addEventListener('load', () => setTimeout(showIosHint, 1500));
  }
}
