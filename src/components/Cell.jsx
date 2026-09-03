import { memo } from 'react';
import CatIcon from './CatIcon';

function Mark({ faded }) {
  return (
    <svg viewBox="0 0 24 24" className={`mark${faded ? ' faded' : ''}`} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
        <path d="M5 5 L19 19" />
        <path d="M19 5 L5 19" />
      </g>
    </svg>
  );
}

function Cell({ index, state, auto, color, skinId, custom, conflict, borders, solved, onDown }) {
  const style = {
    '--cell-color': color,
    borderTopWidth: borders.top ? '2.5px' : '1px',
    borderRightWidth: borders.right ? '2.5px' : '1px',
    borderBottomWidth: borders.bottom ? '2.5px' : '1px',
    borderLeftWidth: borders.left ? '2.5px' : '1px',
    borderTopColor: borders.top ? 'var(--frame)' : undefined,
    borderRightColor: borders.right ? 'var(--frame)' : undefined,
    borderBottomColor: borders.bottom ? 'var(--frame)' : undefined,
    borderLeftColor: borders.left ? 'var(--frame)' : undefined
  };

  const label = state === 2 ? 'cat' : state === 1 ? 'blocked' : auto ? 'auto blocked' : 'empty';

  return (
    <button
      type="button"
      className={`cell${conflict ? ' conflict' : ''}${solved ? ' solved-glow' : ''}`}
      style={style}
      data-index={index}
      aria-label={`Cell ${index + 1}, ${label}`}
      onPointerDown={(event) => {
        event.preventDefault();
        onDown(index);
      }}
    >
      {state === 1 && <Mark />}
      {state === 0 && auto && <Mark faded />}
      {state === 2 && <CatIcon skinId={skinId} custom={custom} className="cat" />}
    </button>
  );
}

export default memo(Cell);
