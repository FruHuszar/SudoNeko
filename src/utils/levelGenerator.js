import { getDifficulty, getGridSize } from './difficulty';

const WINDINESS = { Easy: 0, Medium: 0.45, Hard: 0.72, Extreme: 0.9 };

function createRandom(seed) {
  let state = (seed * 2654435761) >>> 0;
  return function random() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled(list, random) {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function orthogonalNeighbours(index, size) {
  const row = Math.floor(index / size);
  const col = index % size;
  const result = [];
  if (row > 0) result.push(index - size);
  if (row < size - 1) result.push(index + size);
  if (col > 0) result.push(index - 1);
  if (col < size - 1) result.push(index + 1);
  return result;
}

function buildSolution(size, random) {
  const columns = [];
  const order = [];
  for (let i = 0; i < size; i++) order.push(i);

  function place(row) {
    if (row === size) return true;
    for (const col of shuffled(order, random)) {
      if (columns.includes(col)) continue;
      if (row > 0 && Math.abs(columns[row - 1] - col) <= 1) continue;
      columns.push(col);
      if (place(row + 1)) return true;
      columns.pop();
    }
    return false;
  }

  return place(0) ? columns : null;
}

function buildRegions(size, solution, random, windiness) {
  const regions = new Array(size * size).fill(-1);
  const frontiers = [];
  const ids = [];

  for (let row = 0; row < size; row++) {
    const index = row * size + solution[row];
    regions[index] = row;
    frontiers.push([index]);
    ids.push(row);
  }

  let remaining = size * size - size;

  while (remaining > 0) {
    for (const id of shuffled(ids, random)) {
      if (remaining === 0) break;
      const frontier = frontiers[id];
      const steps = 1 + Math.floor(random() * 3);
      for (let step = 0; step < steps && remaining > 0; step++) {
        let target = -1;
        while (frontier.length && target === -1) {
          const pick = random() < windiness ? frontier.length - 1 : Math.floor(random() * frontier.length);
          const free = orthogonalNeighbours(frontier[pick], size).filter((cell) => regions[cell] === -1);
          if (!free.length) {
            frontier.splice(pick, 1);
            continue;
          }
          target = free[Math.floor(random() * free.length)];
        }
        if (target === -1) break;
        regions[target] = id;
        frontier.push(target);
        remaining--;
      }
    }
  }

  return regions;
}

export function findSolutions(size, regions, limit = 2) {
  const usedColumns = new Array(size).fill(false);
  const usedRegions = new Array(size).fill(false);
  const placed = new Array(size).fill(-1);
  const found = [];

  function walk(row) {
    if (row === size) {
      found.push(placed.slice());
      return;
    }
    for (let col = 0; col < size; col++) {
      if (usedColumns[col]) continue;
      const region = regions[row * size + col];
      if (usedRegions[region]) continue;
      if (row > 0 && Math.abs(placed[row - 1] - col) <= 1) continue;
      usedColumns[col] = true;
      usedRegions[region] = true;
      placed[row] = col;
      walk(row + 1);
      usedColumns[col] = false;
      usedRegions[region] = false;
      placed[row] = -1;
      if (found.length >= limit) return;
    }
  }

  walk(0);
  return found;
}

export function countSolutions(size, regions, limit = 2) {
  return findSolutions(size, regions, limit).length;
}

function isConnected(regions, id, size) {
  const cells = [];
  for (let i = 0; i < regions.length; i++) if (regions[i] === id) cells.push(i);
  if (!cells.length) return false;
  const seen = new Set([cells[0]]);
  const queue = [cells[0]];
  while (queue.length) {
    const current = queue.pop();
    for (const next of orthogonalNeighbours(current, size)) {
      if (regions[next] === id && !seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
    }
  }
  return seen.size === cells.length;
}

function perturb(size, regions, solution, random) {
  const seeds = new Set(solution.map((col, row) => row * size + col));
  const cells = shuffled(regions.map((_, index) => index).filter((index) => !seeds.has(index)), random);

  for (const cell of cells) {
    const origin = regions[cell];
    const around = [...new Set(orthogonalNeighbours(cell, size).map((near) => regions[near]))].filter((id) => id !== origin);
    for (const target of shuffled(around, random)) {
      regions[cell] = target;
      if (isConnected(regions, origin, size)) return true;
      regions[cell] = origin;
    }
  }
  return false;
}

function tightenRegions(size, regions, solution, random, maxSteps) {
  for (let step = 0; step < maxSteps; step++) {
    const solutions = findSolutions(size, regions, 2);
    if (solutions.length === 1) return true;

    const alternative = solutions.find((candidate) => candidate.some((col, row) => col !== solution[row]));
    if (!alternative) return true;

    const rows = [];
    for (let row = 0; row < size; row++) if (alternative[row] !== solution[row]) rows.push(row);

    let moved = false;
    for (const row of shuffled(rows, random)) {
      const cell = row * size + alternative[row];
      const origin = regions[cell];
      const around = [...new Set(orthogonalNeighbours(cell, size).map((near) => regions[near]))].filter((id) => id !== origin);
      const clashing = around.filter((id) =>
        alternative.some((col, other) => other !== row && regions[other * size + col] === id)
      );
      const pool = shuffled(clashing.length ? clashing : around, random);

      for (const target of pool) {
        regions[cell] = target;
        if (isConnected(regions, origin, size)) {
          moved = true;
          break;
        }
        regions[cell] = origin;
      }
      if (moved) break;
    }

    if (!moved && !perturb(size, regions, solution, random)) return false;
  }
  return false;
}

function unitsOf(size, regions) {
  const rows = [];
  const cols = [];
  const areas = [];
  for (let i = 0; i < size; i++) {
    rows.push([]);
    cols.push([]);
    areas.push([]);
  }
  for (let index = 0; index < size * size; index++) {
    rows[Math.floor(index / size)].push(index);
    cols[index % size].push(index);
    areas[regions[index]].push(index);
  }
  return [...rows, ...cols, ...areas];
}

function touching(index, size) {
  const row = Math.floor(index / size);
  const col = index % size;
  const result = [];
  for (let r = row - 1; r <= row + 1; r++) {
    for (let c = col - 1; c <= col + 1; c++) {
      if (r < 0 || c < 0 || r >= size || c >= size) continue;
      if (r === row && c === col) continue;
      result.push(r * size + c);
    }
  }
  return result;
}

export function rateByLogic(size, regions) {
  const open = new Array(size * size).fill(true);
  const cats = new Array(size * size).fill(false);
  const units = unitsOf(size, regions);
  const solvedUnits = new Set();
  let placedCount = 0;
  let usedConfinement = false;

  const place = (index) => {
    cats[index] = true;
    open[index] = false;
    placedCount++;
    const row = Math.floor(index / size);
    const col = index % size;
    const region = regions[index];
    for (let i = 0; i < size * size; i++) {
      if (!open[i]) continue;
      if (Math.floor(i / size) === row || i % size === col || regions[i] === region) open[i] = false;
    }
    for (const near of touching(index, size)) open[near] = false;
    units.forEach((unit, id) => {
      if (unit.includes(index)) solvedUnits.add(id);
    });
  };

  while (placedCount < size) {
    let progress = false;

    for (let id = 0; id < units.length; id++) {
      if (solvedUnits.has(id)) continue;
      const candidates = units[id].filter((index) => open[index]);
      if (candidates.length === 0) return { solvable: false, usedConfinement };
      if (candidates.length === 1) {
        place(candidates[0]);
        progress = true;
      }
    }
    if (progress) continue;

    for (let id = 0; id < units.length && !progress; id++) {
      if (solvedUnits.has(id)) continue;
      const candidates = units[id].filter((index) => open[index]);
      const rows = new Set(candidates.map((index) => Math.floor(index / size)));
      const cols = new Set(candidates.map((index) => index % size));
      const areas = new Set(candidates.map((index) => regions[index]));

      const shrink = (keep) => {
        let changed = false;
        for (let i = 0; i < size * size; i++) {
          if (!open[i] || candidates.includes(i)) continue;
          if (keep(i)) {
            open[i] = false;
            changed = true;
          }
        }
        return changed;
      };

      let changed = false;
      if (rows.size === 1) changed = shrink((i) => Math.floor(i / size) === [...rows][0]) || changed;
      if (cols.size === 1) changed = shrink((i) => i % size === [...cols][0]) || changed;
      if (areas.size === 1) changed = shrink((i) => regions[i] === [...areas][0]) || changed;
      if (changed) {
        usedConfinement = true;
        progress = true;
      }
    }

    if (!progress) return { solvable: false, usedConfinement };
  }

  return { solvable: true, usedConfinement };
}

export function generateLevel(level) {
  const size = getGridSize(level);
  const difficulty = getDifficulty(level);
  const windiness = WINDINESS[difficulty];
  const random = createRandom(level * 7919 + size * 131 + 17);
  let fallback = null;

  for (let attempt = 0; attempt < 60; attempt++) {
    const solution = buildSolution(size, random);
    const regions = buildRegions(size, solution, random, windiness * Math.max(0, 1 - attempt / 20));
    if (!tightenRegions(size, regions, solution, random, 240)) continue;

    const puzzle = { level, size, difficulty, regions, solution };
    if (!fallback) fallback = puzzle;

    const rating = rateByLogic(size, regions);
    if (difficulty === 'Easy' && (!rating.solvable || rating.usedConfinement)) continue;
    if (difficulty === 'Medium' && !rating.solvable) continue;
    return puzzle;
  }

  return fallback;
}
