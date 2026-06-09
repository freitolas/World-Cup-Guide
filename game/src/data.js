// Shared data, imported READ-ONLY from the Guide. The Game never forks or
// duplicates this — it's the same daily-updated source the prediction pipeline
// writes. THE AI's frozen scoreline picks come from botPicks.json (see
// scripts/update.mjs §freezeBotPicks).
import { teams } from '../../src/data/teams.js';
import { players } from '../../src/data/players.js';
import { matches } from '../../src/data/matches.js';
import { groups } from '../../src/data/groups.js';
import { venues } from '../../src/data/venues.js';
import predictions from '../../src/data/predictions.json';
import results from '../../src/data/results.json';
import botPicks from '../../src/data/botPicks.json';
import friendliesData from '../../src/data/friendlies.json';
import leaderboardData from '../../src/data/leaderboard.json';
import xFeedData from '../../src/data/x-feed.json';

// THE AI's recent X posts — our own feed (X's embed widget is unreliable).
export const xFeed = xFeedData || [];

export { teams, players, matches, groups, venues, predictions, results, botPicks };

// Global leaderboard — humans who've actually beaten THE AI. Populated by the
// (M2) pick-sync backend; empty until then, which is exactly the honest default
// state. Each entry: { name, you, ai }. A human "beats" THE AI when you > ai.
export const leaders = leaderboardData.leaders || [];
export const leadersUpdated = leaderboardData.updated || null;
// Those actually ahead of THE AI, biggest margin first.
export const humansAhead = leaders
  .filter((l) => l.you > l.ai)
  .sort((a, b) => (b.you - b.ai) - (a.you - a.ai));

// Warm-up friendlies — an ISOLATED surface (own predictions, own scoreboard).
export const friendlies = friendliesData.fixtures || [];
export const friendliesUpdated = friendliesData.updated || null;
export const friendlyKickoff = (f) => new Date(f.kickoff || `${f.date}T00:00:00Z`);
export const friendlyLocked = (f, now = new Date()) =>
  now.getTime() >= friendlyKickoff(f).getTime() - LOCK_LEAD_MS;

export const teamById = Object.fromEntries(teams.map((t) => [t.id, t]));
export const playersByTeam = players.reduce((acc, p) => {
  (acc[p.team] ||= []).push(p);
  return acc;
}, {});

export function team(id) {
  return teamById[id] || { id, name: id, flag: '🌍' };
}

// Kickoff as a Date. Stored times are treated as UTC for now (refine when the
// official per-venue timezones are confirmed; pre-tournament this is harmless).
export function kickoff(m) {
  return new Date(`${m.date}T${m.time || '00:00'}:00Z`);
}

// Picks lock 15 minutes before kickoff — your pick freezes and THE AI's is
// revealed. Must be ≥ the X-post lead so THE AI's pick can never go public on X
// while you can still edit yours. Before lock you can edit; at/after lock it
// freezes (Game brief §4). One shared rule for both sides.
export const LOCK_LEAD_MS = 15 * 60 * 1000;
export function isLocked(m, now = new Date()) {
  return now.getTime() >= kickoff(m).getTime() - LOCK_LEAD_MS;
}

export const resultFor = (m) => results[m.id] || null;
export const botPickFor = (m) => botPicks[m.id] || null;
export const predictionFor = (m) => predictions[m.id] || null;

// Group-stage scope (all current fixtures are group stage; knockout arrives in M2).
export const groupMatches = matches
  .filter((m) => m.group)
  .slice()
  .sort((a, b) => kickoff(a) - kickoff(b));

// Fixtures grouped by calendar date, ascending — used by the fixtures-first home.
export function matchesByDate(list = groupMatches) {
  const map = new Map();
  for (const m of list) (map.get(m.date) || map.set(m.date, []).get(m.date)).push(m);
  return [...map.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1));
}
