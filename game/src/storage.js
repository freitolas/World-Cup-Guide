// localStorage-only pick storage. No server, no account (Milestone 1). Picks are
// migrated into an account on signup in M2.
const KEY = 'hai_picks_v1';
const EVENT = 'hai:picks-changed';

export function getPicks() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

function write(picks) {
  localStorage.setItem(KEY, JSON.stringify(picks));
  window.dispatchEvent(new Event(EVENT));
}

export function setPick(matchId, score) {
  const picks = getPicks();
  picks[matchId] = score;
  write(picks);
}

export function clearPick(matchId) {
  const picks = getPicks();
  delete picks[matchId];
  write(picks);
}

export const PICKS_EVENT = EVENT;
