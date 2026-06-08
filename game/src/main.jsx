import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { captureAttribution } from './attribution.js';
import './index.css';

// Record first-touch marketing source (utm_* / referrer) before anything else.
captureAttribution();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
