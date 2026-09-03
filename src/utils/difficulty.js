export const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Extreme'];

export function getDifficulty(level) {
  const safe = Math.max(1, Math.floor(level));
  const base = Math.min(Math.floor((safe - 1) / 50), 3);
  const spike = safe % 5 === 0 ? 1 : 0;
  return DIFFICULTIES[Math.min(base + spike, 3)];
}

export function getGridSize(level) {
  const difficulty = getDifficulty(level);
  if (difficulty === 'Medium') return 7;
  if (difficulty === 'Hard') return 8;
  if (difficulty === 'Extreme') return 9;
  if (level <= 4) return 5;
  return Math.floor(level / 2) % 2 === 0 ? 5 : 6;
}
