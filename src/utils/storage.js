import { DEFAULT_CUSTOM } from '../components/CatIcon';

const KEY = 'sudoneko.save.v1';
const LEGACY_KEY = 'sudocat.save.v2';

export const DEFAULTS = {
  level: 1,
  completed: [],
  theme: 'blueberry',
  skin: 'calico',
  custom: DEFAULT_CUSTOM,
  bestTimes: {},
  settings: { autoMark: true, sound: true },
  solver: { size: 6, cells: [] },
  seenWelcome: false
};

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY) || localStorage.getItem(LEGACY_KEY);
    if (!raw) return { ...DEFAULTS };
    const stored = JSON.parse(raw);
    return {
      ...DEFAULTS,
      ...stored,
      custom: { ...DEFAULT_CUSTOM, ...stored.custom },
      settings: { ...DEFAULTS.settings, ...stored.settings },
      completed: Array.isArray(stored.completed) ? stored.completed : [],
      solver: stored.solver && Array.isArray(stored.solver.cells) ? stored.solver : DEFAULTS.solver,
      bestTimes: stored.bestTimes || {}
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveState(patch) {
  try {
    const next = { ...loadState(), ...patch };
    localStorage.setItem(KEY, JSON.stringify(next));
    return next;
  } catch {
    return loadState();
  }
}

export function mergeProgress(local, remote) {
  if (!remote) return local;
  const completed = [...new Set([...(local.completed || []), ...(remote.completed || [])])].sort((a, b) => a - b);
  const bestTimes = { ...(remote.bestTimes || {}) };
  for (const [level, time] of Object.entries(local.bestTimes || {})) {
    const other = bestTimes[level];
    bestTimes[level] = other === undefined ? time : Math.min(other, time);
  }
  return {
    ...remote,
    ...local,
    completed,
    bestTimes,
    level: Math.max(local.level || 1, remote.level || 1),
    custom: { ...DEFAULT_CUSTOM, ...remote.custom, ...local.custom },
    settings: { ...DEFAULTS.settings, ...remote.settings, ...local.settings }
  };
}
