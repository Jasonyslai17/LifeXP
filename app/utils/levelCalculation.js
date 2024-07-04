const MAX_LEVEL = 100;
const XP_THRESHOLDS = [
  0, 4, 8, 12, 16, 21, 26, 31, 36, 42, 48, 54, 61, 68, 75, 83, 91, 99, 108, 117,
  127, 137, 148, 159, 171, 183, 196, 210, 224, 239, 255, 272, 289, 307, 326, 346,
  367, 389, 412, 436, 462, 489, 517, 547, 578, 611, 645, 681, 719, 759, 801,
  845, 891, 939, 990, 1043, 1099, 1158, 1220, 1285, 1353, 1425, 1500, 1579, 1662,
  1749, 1840, 1936, 2037, 2143, 2254, 2371, 2493, 2622, 2757, 2899, 3048, 3204,
  3368, 3540, 3721, 3911, 4110, 4319, 4539, 4770, 5012, 5266, 5533, 5814, 6109,
  6418, 6743, 7084, 7442, 7818, 8213, 8628, 9063, 9520, 10000
];

export function getMaxXpForLevel(level) {
  if (level <= 0) return 0;
  if (level >= MAX_LEVEL) return XP_THRESHOLDS[XP_THRESHOLDS.length - 1];
  return XP_THRESHOLDS[level];
}

export function calculateLevel(xp) {
  for (let i = 0; i < XP_THRESHOLDS.length; i++) {
    if (xp < XP_THRESHOLDS[i]) {
      return i;
    }
  }
  return MAX_LEVEL;
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

export function getXpRequiredForNextLevel(xp) {
  const currentLevel = calculateLevel(xp);
  if (currentLevel < MAX_LEVEL) {
    return getMaxXpForLevel(currentLevel) - getMaxXpForLevel(currentLevel - 1);
  }
  return 0; // Max level reached
}