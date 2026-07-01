export function getXpMultiplier(activeSubjectCount: number): number {
  if (activeSubjectCount <= 1) return 3;
  if (activeSubjectCount === 2) return 2;
  if (activeSubjectCount === 3) return 1.5;
  return 1;
}

export function xpRequired(level: number): number {
  return 100 + (level - 1) * 10;
}

export function calculateLevelUp(currentXp: number, currentLevel: number, xpGain: number) {
  let xp = currentXp + xpGain;
  let level = currentLevel;

  while (xp >= xpRequired(level)) {
    xp -= xpRequired(level);
    level++;
  }

  return { xp, level };
}
