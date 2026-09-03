import { useMemo, useRef } from 'react';
import Cell from './Cell';

export function boardBorders(size, regions) {
  return regions.map((region, index) => {
    const row = Math.floor(index / size);
    const col = index % size;
    return {
      top: row === 0 || regions[index - size] !== region,
      bottom: row === size - 1 || regions[index + size] !== region,
      left: col === 0 || regions[index - 1] !== region,
      right: col === size - 1 || regions[index + 1] !== region
    };
  });
}

function cellUnder(event) {
  const node = document.elementFromPoint(event.clientX, event.clientY);
  const cell = node?.closest?.('.cell');
  if (!cell) return null;
  const index = Number(cell.dataset.index);
  return Number.isNaN(index) ? null : index;
}

export default function GameBoard({
  puzzle,
  cells,
  autoMarks,
  conflicts,
  skinId,
  custom,
  solved,
  paused,
  onCellDown,
  onCellOver,
  onCellUp,
  onResume
}) {
  const { size, regions } = puzzle;
  const borders = useMemo(() => boardBorders(size, regions), [regions, size]);
  const tracking = useRef(false);

  const release = () => {
    tracking.current = false;
    onCellUp();
  };

  return (
    <div className="board-area">
      <div className="board-wrap">
        <div
          className="board"
          style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
          onPointerDown={() => {
            tracking.current = true;
          }}
          onPointerMove={(event) => {
            if (!tracking.current) return;
            const index = cellUnder(event);
            if (index !== null) onCellOver(index);
          }}
          onPointerUp={release}
          onPointerCancel={release}
          onPointerLeave={release}
        >
          {borders.map((border, index) => (
            <Cell
              key={index}
              index={index}
              state={cells[index] || 0}
              auto={autoMarks.has(index)}
              color={`var(--region-${regions[index] + 1})`}
              skinId={skinId}
              custom={custom}
              conflict={conflicts.has(index)}
              borders={border}
              solved={solved}
              onDown={onCellDown}
            />
          ))}
        </div>
        {paused && (
          <button type="button" className="board-veil" onPointerDown={onResume}>
            <span>Paused</span>
            <span className="veil-hint">Tap to keep playing</span>
          </button>
        )}
      </div>
    </div>
  );
}
