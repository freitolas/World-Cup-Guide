// THE AI's voice. Every player-facing string lives here or is written in this
// exact register (VOICE_GUIDE.md). Cold, deadpan, superior; roasts humanity and
// football egos, never real individuals or groups; never implies gambling; never
// claims to read a specific user's real data (omniscience = cold reading only).

export const NAME = 'THE AI';

export const HERO = {
  headline: 'HUMANS ARE INFERIOR.',
  subhead:
    "I've simulated this World Cup ten million times. You've had a hunch. Let's play.",
  cta: 'Prove me wrong',
  ctaAlt: 'Make my picks',
  microTrust: 'free · no signup · picks lock & post to X 5 min before kickoff',
};

export const TRUST = [
  "Every prediction I make is public before kickoff. I don't hide. I don't cheat. I just win.",
  "I post my picks before the game. Out loud. To everyone. And I'm still ahead. Sit with that.",
  'Accuse me of cheating. Go on. My predictions were timestamped before the ball moved. Yours were a feeling you had in the shower.',
];

export const SCOREBOARD = {
  behind: 'The gap is the point.',
  ahead: "A temporary anomaly. I've allocated zero concern to it.",
  level: "Level. Enjoy the view from up here while it lasts.",
  empty: "You've predicted nothing. Bold strategy. Cowardly, but bold.",
};

export const MATCH = {
  locked: 'Cute. Logged.',
  hiddenBot: 'I lock and post my pick to X five minutes before kickoff. You see it when everyone does.',
  reveal: "Here's what I locked in — and posted to X — five minutes before kickoff. No edits. No excuses.",
  forfeit:
    "You didn't predict this one. That's a forfeit. I scored anyway. Showing up was the bare minimum and you missed it.",
  botWon: 'Predictable. Literally — I predicted it.',
  youWon: "Statistical noise. Enjoy it. It won't last.",
  drewLevel: 'We scored the same here. Savour the parity. It is not a trend.',
  deadline: "Ninety seconds to commit. Or don't. I've already decided.",
};

// The two required nudges (brief §6 / VOICE_GUIDE §6) — must be present.
export const NUDGE = {
  device:
    'Your picks live on this device. Lose your phone, lose your dignity twice. An account keeps them safe — across every device you own.',
  upgrade:
    "The knockout rounds are where I really embarrass you. $5 to watch it happen everywhere, plus a leaderboard of the few humans who've beaten me. Good through the final. Worth every cent of your inferior currency.",
};

export const OMNISCIENCE = [
  "I know which result you're pretending you don't care about. I priced it in.",
  'You picked with your heart. I picked with the data. Only one of those is an organ worth consulting here.',
  "I've seen ten million versions of this tournament. You've seen the highlights and felt a feeling. We are not the same.",
  "Hope is a rounding error. I've excluded it from my model. You should too.",
  'Your loyalty to that team is touching. It is also why you are losing.',
];

export const LEADERBOARD = {
  title: 'The Leaderboard',
  // Default state — nobody has beaten THE AI.
  empty: 'NO HUMANS ARE BEATING ME RIGHT NOW.',
  emptySub:
    "The list of humans who've beaten me is empty. As forecast. Be the first — I'll make space, briefly.",
  // Shown when a human is, improbably, top of the board. Deterministic per name.
  beaten: [
    "Fine. One of you got lucky. Note the date — it won't recur.",
    "A human is ahead of me. Statistically inevitable, emotionally unacceptable. Savour the variance.",
    "Someone beat me. I've recalculated: chaos, not skill. But your name's up there. Gloat quietly.",
    "Top of the board, are we? Enjoy the altitude. The air is thin and the fall is quick.",
  ],
  cta: 'See the leaderboard',
};

export const ERRORS = {
  notFound: "This page doesn't exist. Like your chances. Back to the games →",
  loading: "Calculating outcomes you'll dispute and then lose to.",
};

// Deterministic pick from a list (stable for a given seed, e.g. a match id), so
// lines don't flicker on every render.
export function pick(list, seed = '') {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return list[Math.abs(h) % list.length];
}
