import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Header from './components/Header';
import InstallApp from './components/InstallApp';
import GameBoard from './components/GameBoard';
import ThemeSelector from './components/ThemeSelector';
import CustomCatModal from './components/CustomCatModal';
import WinModal from './components/WinModal';
import WelcomeModal from './components/WelcomeModal';
import SettingsModal from './components/SettingsModal';
import LevelsModal from './components/LevelsModal';
import SolverModal from './components/SolverModal';
import ConfirmModal from './components/ConfirmModal';
import { unlocksAt } from './components/CatIcon';
import { generateLevel } from './utils/levelGenerator';
import { loadState, saveState, mergeProgress } from './utils/storage';
import { syncWithDrive } from './utils/googleDrive';
import { buzz, playButton, playCat, playErase, playMark, setSoundEnabled, warmUpSound } from './utils/sound';

function freshBoard(puzzle) {
  return { level: puzzle.level, cells: new Array(puzzle.size * puzzle.size).fill(0), history: [] };
}

export function autoMarkedCells(cells, size, regions) {
  const marks = new Set();
  for (let index = 0; index < cells.length; index++) {
    if (cells[index] !== 2) continue;
    const row = Math.floor(index / size);
    const col = index % size;
    const region = regions[index];
    for (let i = 0; i < size * size; i++) {
      if (cells[i] === 2) continue;
      const sameLine = Math.floor(i / size) === row || i % size === col || regions[i] === region;
      const touches = Math.abs(Math.floor(i / size) - row) <= 1 && Math.abs((i % size) - col) <= 1;
      if (sameLine || touches) marks.add(i);
    }
  }
  return marks;
}

function findConflicts(cells, size, regions) {
  const cats = [];
  for (let i = 0; i < cells.length; i++) if (cells[i] === 2) cats.push(i);

  const bad = new Set();
  const groups = [new Map(), new Map(), new Map()];

  for (const index of cats) {
    const keys = [Math.floor(index / size), index % size, regions[index]];
    keys.forEach((key, slot) => {
      const list = groups[slot].get(key) || [];
      list.push(index);
      groups[slot].set(key, list);
    });
  }

  for (const group of groups) {
    for (const list of group.values()) {
      if (list.length > 1) list.forEach((index) => bad.add(index));
    }
  }

  for (let a = 0; a < cats.length; a++) {
    for (let b = a + 1; b < cats.length; b++) {
      const rowGap = Math.abs(Math.floor(cats[a] / size) - Math.floor(cats[b] / size));
      const colGap = Math.abs((cats[a] % size) - (cats[b] % size));
      if (rowGap <= 1 && colGap <= 1) {
        bad.add(cats[a]);
        bad.add(cats[b]);
      }
    }
  }

  return { cats, bad };
}

export default function App() {
  const [saved] = useState(loadState);
  const [level, setLevel] = useState(saved.level);
  const [completed, setCompleted] = useState(saved.completed);
  const [theme, setTheme] = useState(saved.theme);
  const [skin, setSkin] = useState(saved.skin);
  const [custom, setCustom] = useState(saved.custom);
  const [bestTimes, setBestTimes] = useState(saved.bestTimes);
  const [settings, setSettings] = useState(saved.settings);
  const [solverBoard, setSolverBoard] = useState(saved.solver);
  const [showWelcome, setShowWelcome] = useState(!saved.seenWelcome);
  const [openPanel, setOpenPanel] = useState(null);
  const [skipTarget, setSkipTarget] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [paused, setPaused] = useState(false);
  const [won, setWon] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  const puzzle = useMemo(() => generateLevel(level), [level]);
  const [board, setBoard] = useState(() => freshBoard(puzzle));
  const stroke = useRef(null);

  if (board.level !== puzzle.level) {
    setBoard(freshBoard(puzzle));
    setSeconds(0);
    setPaused(false);
    setWon(false);
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    setSoundEnabled(settings.sound);
    warmUpSound();
  }, [settings.sound]);

  useEffect(() => {
    saveState({ level, completed, theme, skin, custom, bestTimes, settings, solver: solverBoard });
  }, [level, completed, theme, skin, custom, bestTimes, settings, solverBoard]);

  useEffect(() => {
    if (won || paused || showWelcome) return undefined;
    const id = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(id);
  }, [won, paused, showWelcome, puzzle]);

  useEffect(() => {
    if (!notice) return undefined;
    const id = setTimeout(() => setNotice(''), 4000);
    return () => clearTimeout(id);
  }, [notice]);

  const { cats, bad } = useMemo(() => findConflicts(board.cells, puzzle.size, puzzle.regions), [board, puzzle]);

  const autoMarks = useMemo(
    () => (settings.autoMark ? autoMarkedCells(board.cells, puzzle.size, puzzle.regions) : new Set()),
    [settings.autoMark, board, puzzle]
  );

  useEffect(() => {
    if (won || cats.length !== puzzle.size || bad.size > 0) return;
    setWon(true);
    setCompleted((current) => (current.includes(puzzle.level) ? current : [...current, puzzle.level].sort((a, b) => a - b)));
    setBestTimes((current) => {
      const best = current[puzzle.level];
      if (best !== undefined && best <= seconds) return current;
      return { ...current, [puzzle.level]: seconds };
    });
  }, [cats, bad, puzzle, seconds, won]);

  const live = useRef(null);
  live.current = { board, autoMarks, autoMark: settings.autoMark, paused, won };

  const commit = useCallback((run) => {
    setBoard({ level: run.level, cells: run.cells.slice(), history: [...run.past.slice(-60), run.base] });
  }, []);

  const mark = useCallback(
    (index) => {
      const run = stroke.current;
      const value = run.cells[index];
      if (run.mode === 'paint' ? value !== 0 : value !== 1) return;
      run.cells[index] = run.mode === 'paint' ? 1 : 0;
      commit(run);
      if (run.mode === 'paint') playMark();
      else playErase();
    },
    [commit]
  );

  const cycle = useCallback(
    (index) => {
      const run = stroke.current;
      const value = run.cells[index];
      const auto = live.current.autoMark && live.current.autoMarks.has(index);
      const next = value === 0 ? (auto ? 2 : 1) : value === 1 ? 2 : 0;
      run.cells[index] = next;
      commit(run);
      if (next === 2) playCat();
      else if (next === 1) playMark();
      else playErase();
    },
    [commit]
  );

  const handleCellDown = useCallback((index) => {
    const { board: current, paused: held, won: solved } = live.current;
    if (held || solved) return;
    stroke.current = {
      level: current.level,
      base: current.cells,
      past: current.history,
      cells: current.cells.slice(),
      mode: current.cells[index] === 1 ? 'erase' : 'paint',
      start: index,
      moved: false
    };
    buzz(8);
  }, []);

  const handleCellOver = useCallback(
    (index) => {
      const run = stroke.current;
      if (!run) return;
      if (!run.moved) {
        if (index === run.start) return;
        run.moved = true;
        buzz(26);
        mark(run.start);
      }
      mark(index);
    },
    [mark]
  );

  const handleCellUp = useCallback(() => {
    const run = stroke.current;
    if (!run) return;
    if (!run.moved) cycle(run.start);
    stroke.current = null;
  }, [cycle]);

  const undo = () => {
    setBoard((current) => {
      if (!current.history.length) return current;
      return { ...current, cells: current.history[current.history.length - 1], history: current.history.slice(0, -1) };
    });
  };

  const clear = () => {
    setBoard((current) => ({
      ...current,
      cells: new Array(puzzle.size * puzzle.size).fill(0),
      history: [...current.history.slice(-60), current.cells]
    }));
  };

  const goTo = (next) => {
    if (next < 1) return;
    setLevel(next);
    setOpenPanel(null);
    setSkipTarget(null);
  };

  const requestNext = () => {
    const next = level + 1;
    if (won || completed.includes(level)) goTo(next);
    else setSkipTarget(next);
  };

  const replay = () => {
    setBoard(freshBoard(puzzle));
    setSeconds(0);
    setPaused(false);
    setWon(false);
  };

  const save = async () => {
    if (saving) return;
    setSaving(true);
    setNotice('Talking to Google Drive…');
    try {
      const merged = await syncWithDrive(loadState(), mergeProgress);
      saveState(merged);
      setCompleted(merged.completed);
      setBestTimes(merged.bestTimes);
      setNotice(`Progress saved · ${merged.completed.length} levels solved`);
    } catch (error) {
      setNotice(error.message);
    } finally {
      setSaving(false);
    }
  };

  const wins = completed.length;

  return (
    <div
      className="app"
      onPointerDownCapture={(event) => {
        const button = event.target.closest?.('button');
        if (button && !button.classList.contains('cell') && !button.classList.contains('solver-cell')) playButton();
      }}
    >
      <Header
        level={puzzle.level}
        difficulty={puzzle.difficulty}
        size={puzzle.size}
        seconds={seconds}
        paused={paused}
        onTogglePause={() => !won && setPaused((value) => !value)}
        onOpenSettings={() => setOpenPanel('settings')}
        onOpenLevels={() => setOpenPanel('levels')}
      />

      <GameBoard
        puzzle={puzzle}
        cells={board.cells}
        autoMarks={autoMarks}
        conflicts={bad}
        skinId={skin}
        custom={custom}
        solved={won}
        paused={paused}
        onCellDown={handleCellDown}
        onCellOver={handleCellOver}
        onCellUp={handleCellUp}
        onResume={() => setPaused(false)}
      />

      <div className="footer">
        <div className="controls">
          <button type="button" className="icon-button" aria-label="Previous level" disabled={level === 1} onPointerDown={() => goTo(level - 1)}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 6 L8 12 L14 18" />
            </svg>
          </button>
          <button type="button" className="pill-button" onPointerDown={undo}>
            Undo
          </button>
          <div className="counter">
            <strong>
              {cats.length}/{puzzle.size}
            </strong>
            <span>cats placed</span>
          </div>
          <button type="button" className="pill-button" onPointerDown={clear}>
            Clear
          </button>
          <button type="button" className="icon-button" aria-label="Next level" onPointerDown={requestNext}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 6 L16 12 L10 18" />
            </svg>
          </button>
        </div>

        <div className="utility">
          <button
            type="button"
            className="pill-button small"
            onPointerDown={() => setOpenPanel((current) => (current === 'solver' ? null : 'solver'))}
          >
            Solver
          </button>
          <InstallApp />
          <button type="button" className="pill-button small" onPointerDown={() => setOpenPanel('looks')}>
            Customize
          </button>
        </div>
      </div>

      {showWelcome && (
        <WelcomeModal
          saving={saving}
          notice={notice}
          onSave={save}
          onChoose={(autoMark) => {
            setSettings((current) => ({ ...current, autoMark }));
            saveState({ seenWelcome: true });
            setShowWelcome(false);
          }}
        />
      )}

      {openPanel === 'settings' && (
        <SettingsModal
          settings={settings}
          saving={saving}
          notice={notice}
          onChange={setSettings}
          onSave={save}
          onClose={() => setOpenPanel(null)}
        />
      )}

      {openPanel === 'levels' && (
        <LevelsModal current={level} completed={completed} onPick={goTo} onClose={() => setOpenPanel(null)} />
      )}

      {openPanel === 'solver' && (
        <SolverModal
          skinId={skin}
          custom={custom}
          saved={solverBoard}
          onSave={setSolverBoard}
          onClose={() => setOpenPanel(null)}
        />
      )}

      {openPanel === 'looks' && (
        <ThemeSelector
          theme={theme}
          skin={skin}
          custom={custom}
          wins={wins}
          onTheme={setTheme}
          onSkin={setSkin}
          onEditCustom={() => setOpenPanel('editor')}
          onClose={() => setOpenPanel(null)}
        />
      )}

      {openPanel === 'editor' && (
        <CustomCatModal custom={custom} onChange={setCustom} onClose={() => setOpenPanel('looks')} />
      )}

      {skipTarget && (
        <ConfirmModal
          title="Skip this level?"
          message="It won't be marked as complete. You can finish it another time from the levels menu."
          confirmLabel="Skip for now"
          cancelLabel="Keep trying"
          onConfirm={() => goTo(skipTarget)}
          onCancel={() => setSkipTarget(null)}
        />
      )}

      {won && (
        <WinModal
          level={puzzle.level}
          seconds={seconds}
          best={bestTimes[puzzle.level] ?? seconds}
          skinId={skin}
          custom={custom}
          unlocked={unlocksAt(wins)}
          onNext={() => goTo(level + 1)}
          onReplay={replay}
        />
      )}
    </div>
  );
}
