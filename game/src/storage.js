// localStorage pick storage, namespaced so the World Cup game and the warm-up
// (friendlies) game keep entirely separate scoreboards. No server (Milestone 1).
const KEY = (ns) => `hai_picks_${ns}`;
const EVENT = 'hai:picks-changed';

export function getPicks(ns = 'wc') {
  try {
    return JSON.parse(localStorage.getItem(KEY(ns))) || {};
  } catch {
    return {};
  }
}

function write(ns, picks) {
  localStorage.setItem(KEY(ns), JSON.stringify(picks));
  window.dispatchEvent(new Event(EVENT));
}

export function setPick(matchId, score, ns = 'wc') {
  const picks = getPicks(ns);
  picks[matchId] = score;
  write(ns, picks);
}

export function clearPick(matchId, ns = 'wc') {
  const picks = getPicks(ns);
  delete picks[matchId];
  write(ns, picks);
}

export const PICKS_EVENT = EVENT;
