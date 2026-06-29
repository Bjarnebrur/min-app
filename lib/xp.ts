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
