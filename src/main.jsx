import * as l from 'react';
import * as u from 'react-dom/client';
import * as f from 'react/jsx-runtime';
import { Te } from './App.jsx';
import './index.css';
import { registerServiceWorker, setupInstallPrompt } from './pwa.js';
import { setupCookieConsent } from './cookie-consent.js';

(0, u.createRoot)(document.getElementById(`root`)).render(
  (0, f.jsx)(l.StrictMode, { children: (0, f.jsx)(Te, {}) }),
);

registerServiceWorker();
setupInstallPrompt();
setupCookieConsent();
