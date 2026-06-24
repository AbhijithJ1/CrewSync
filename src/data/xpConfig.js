// ─────────────────────────────────────────────────────────────
// XP LEVEL SYSTEM
// ─────────────────────────────────────────────────────────────
export const calculateLevelInfo = (xp) => {
  const level = Math.floor(xp / 100) + 1;
  const prevXPThreshold = (level - 1) * 100;
  const nextXPThreshold = level * 100;

  let rankTitle = 'Rookie';
  if (xp < 100) rankTitle = 'Rookie';
  else if (xp < 250) rankTitle = 'Helper';
  else if (xp < 500) rankTitle = 'Operator';
  else if (xp < 900) rankTitle = 'Specialist';
  else if (xp < 1500) rankTitle = 'Elite Crew';
  else rankTitle = 'Core Leader';

  return { level, rankTitle, prevXPThreshold, nextXPThreshold };
};

// XP rewards config
export const XP_REWARDS = {
  low: 10,
  medium: 20,
  high: 35,
  critical: 50,
  firstResponder: 10,
  streak: 15,
  categoryRepeatPenalty: 0.5,
};

// ─────────────────────────────────────────────────────────────
// ACHIEVEMENTS CATALOGUE
// ─────────────────────────────────────────────────────────────
export const ACHIEVEMENTS = [
  { id: 'First Task Completed', name: 'Rookie Complete', desc: 'Resolved your first assigned task.', icon: '✦' },
  { id: '5 Tasks Completed', name: 'Stalwart Helper', desc: 'Resolved 5 tasks on the grid.', icon: '✦' },
  { id: '10 Tasks Completed', name: 'Grid Veteran', desc: 'Completed 10 tasks on the grid.', icon: '✦' },
  { id: 'First Critical Task', name: 'Crisis Solver', desc: 'Safeguarded a critical status task.', icon: '✦' },
  { id: 'Fastest Responder', name: 'Lightning Strike', desc: 'First to accept an incoming alert.', icon: '✦' },
  { id: '7-Day Active Streak', name: 'Iron Streak', desc: 'Maintained a 7-day coordination streak.', icon: '✦' },
  { id: '100% Response Rate', name: 'Flawless Grid', desc: 'Maintained a perfect resolution rate.', icon: '✦' },
];
