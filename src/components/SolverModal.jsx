import { useEffect, useRef, useState } from 'react';
import CatIcon from './CatIcon';
import { boardBorders } from './GameBoard';
import { findSolutions } from '../utils/levelGenerator';

const SIZES = [5, 6, 7, 8, 9];

export default function SolverModal({ skinId, custom, saved, onSave, onClose }) {
  const [size, setSize] = useState(saved.size);
  const [paint, setPaint] = useState(0);
  const [cells, setCells] = useState(() =>
    saved.cells.length === saved.size * saved.size ? saved.cells : new Array(saved.size * saved.size).fill(-1)
  );
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState('Colour the patches, then solve.');
  const painting = useRef(false);

  useEffect(() => {
    onSave({ size, cells });
  }, [size, cells, onSave]);

  const reset = (nextSize) => {
    setSize(nextSize);
    setCells(new Array(nextSize * nextSize).fill(-1));
    setPaint(0);
    setResult(null);
    setMessage('Colour the patches, then solve.');
  };

  const applyPaint = (index) => {
    setResult(null);
    setCells((current) => {
      if (current[index] === paint) return current;
      const next = current.slice();
      next[index] = paint;
      return next;
    });
  };

  const solve = () => {
    if (cells.some((value) => value < 0)) {
      setMessage('Every square needs a colour first.');
      return;
    }
    const used = new Set(cells);
    if (used.size !== size) {
      setMessage(`Use exactly ${size} colours — you have ${used.size}.`);
      return;
    }
    const answers = findSolutions(size, cells, 2);
    if (!answers.length) {
      setResult(null);
      setMessage('No arrangement fits those patches.');
      return;
    }
    setResult(answers[0]);
    setMessage(answers.length > 1 ? 'More than one answer fits. Here is one.' : 'Solved.');
  };

  const borders = boardBorders(size, cells.map((value) => (value < 0 ? -1 : value)));

  return (
    <div className="modal-backdrop solver-dock" onPointerDown={onClose}>
      <div className="modal solver" onPointerDown={(event) => event.stopPropagation()}>
        <h2>Solve any board</h2>
        <div className="size-row">
          {SIZES.map((option) => (
            <button
              key={option}
              type="button"
              className={`size-chip${option === size ? ' active' : ''}`}
              onPointerDown={() => reset(option)}
            >
              {option}×{option}
            </button>
          ))}
        </div>

        <div
          className="solver-board"
          style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
          onPointerUp={() => {
            painting.current = false;
          }}
          onPointerLeave={() => {
            painting.current = false;
          }}
        >
          {cells.map((value, index) => (
            <button
              key={index}
              type="button"
              className="solver-cell"
              aria-label={`Square ${index + 1}`}
              style={{
                background: value < 0 ? 'var(--board-bg)' : `var(--region-${value + 1})`,
                borderTopWidth: borders[index].top ? '2.5px' : '1px',
                borderRightWidth: borders[index].right ? '2.5px' : '1px',
                borderBottomWidth: borders[index].bottom ? '2.5px' : '1px',
                borderLeftWidth: borders[index].left ? '2.5px' : '1px'
              }}
              onPointerDown={(event) => {
                event.preventDefault();
                painting.current = true;
                applyPaint(index);
              }}
              onPointerEnter={() => painting.current && applyPaint(index)}
            >
              {result && result[Math.floor(index / size)] === index % size && (
                <CatIcon skinId={skinId} custom={custom} className="cat" />
              )}
            </button>
          ))}
        </div>

        <div className="palette">
          {Array.from({ length: size }, (_, i) => (
            <button
              key={i}
              type="button"
              className={`paint-chip${paint === i ? ' active' : ''}`}
              aria-label={`Colour ${i + 1}`}
              style={{ background: `var(--region-${i + 1})` }}
              onPointerDown={() => setPaint(i)}
            />
          ))}
        </div>

        <p className="solver-message">{message}</p>

        <div className="solver-actions">
          <button type="button" className="pill-button" onPointerDown={() => reset(size)}>
            Clear
          </button>
          <button type="button" className="pill-button accent" onPointerDown={solve}>
            Solve
          </button>
          <button type="button" className="pill-button" onPointerDown={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
