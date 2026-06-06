import { useState, useEffect } from 'react';
import { getPicks, PICKS_EVENT } from './storage.js';

// Live view of the localStorage picks (updates on change, and across tabs).
export function usePicks() {
  const [picks, setPicks] = useState(getPicks);
  useEffect(() => {
    const refresh = () => setPicks(getPicks());
    window.addEventListener(PICKS_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(PICKS_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);
  return picks;
}

// Tiny hash router (no dependency). Routes: '/', '/play', '/team/:id'.
export function useHashRoute() {
  const read = () => window.location.hash.replace(/^#/, '') || '/';
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const onChange = () => {
      setRoute(read());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

export function go(path) {
  window.location.hash = path;
}

// A clock that ticks every `ms` so lock/reveal states flip live without reload.
export function useNow(ms = 30000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}
