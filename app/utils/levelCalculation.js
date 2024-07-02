const MAX_LEVEL = 200;
const MAX_XP = 10000;

export function getMaxXpForLevel(level) {
  if (level <= 0) return 0;
  if (level >= MAX_LEVEL) return MAX_XP;
  
  // This formula creates a curve that starts easy and gets progressively harder
  return Math.round(25 * Math.pow(level, 2));
}

export function calculateLevel(xp) {
  let level = 0;
  while (level < MAX_LEVEL && getMaxXpForLevel(level + 1) <= xp) {
    level++;
  }
  return Math.max(1, level); // Ensure the minimum level is 1
}

export function calculateXpForNextLevel(currentXp) {
  const currentLevel = calculateLevel(currentXp);
  if (currentLevel < MAX_LEVEL) {
    return getMaxXpForLevel(currentLevel + 1) - currentXp;
  }
  return 0; // Max level reached
}

export function getXpInCurrentLevel(xp) {
  const currentLevel = calculateLevel(xp);
  const currentLevelThreshold = getMaxXpForLevel(currentLevel - 1);
  return xp - currentLevelThreshold;
}