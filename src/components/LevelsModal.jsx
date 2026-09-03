import { useState } from 'react';

const PER_PAGE = 40;

function Tuna() {
  return (
    <svg className="tuna" viewBox="0 0 24 16" aria-hidden="true">
      <path d="M2 8 q6 -6 13 -1 l5 -3 -1.6 4.2 1.6 4.2 -5 -3 q-7 5 -13 -1.4 z" fill="#f2b632" stroke="#a9711a" strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="7.4" cy="7.2" r="1" fill="#a9711a" />
    </svg>
  );
}

export default function LevelsModal({ current, completed, onPick, onClose }) {
  const done = new Set(completed);
  const highest = Math.max(current, ...(completed.length ? completed : [1]));
  const pages = Math.max(1, Math.ceil((highest + 10) / PER_PAGE));
  const [page, setPage] = useState(Math.floor((current - 1) / PER_PAGE));

  const start = page * PER_PAGE + 1;
  const levels = Array.from({ length: PER_PAGE }, (_, i) => start + i);

  return (
    <div className="modal-backdrop" onPointerDown={onClose}>
      <div className="modal levels" onPointerDown={(event) => event.stopPropagation()}>
        <h2>Levels</h2>
        <p className="levels-count">{completed.length} {completed.length === 1 ? 'level' : 'levels'} solved</p>
        <div className="level-grid">
          {levels.map((level) => (
            <button
              key={level}
              type="button"
              className={`level-chip${level === current ? ' current' : ''}${done.has(level) ? ' done' : ''}`}
              onPointerDown={() => onPick(level)}
            >
              {level}
              {done.has(level) && <Tuna />}
            </button>
          ))}
        </div>
        <div className="pager">
          <button type="button" className="icon-button" aria-label="Earlier levels" disabled={page === 0} onPointerDown={() => setPage(page - 1)}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 6 L8 12 L14 18" />
            </svg>
          </button>
          <span className="pager-label">
            {start}–{start + PER_PAGE - 1}
          </span>
          <button type="button" className="icon-button" aria-label="Later levels" disabled={page >= pages - 1} onPointerDown={() => setPage(page + 1)}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 6 L16 12 L10 18" />
            </svg>
          </button>
        </div>
        <button type="button" className="pill-button accent" onPointerDown={onClose}>
          Back to the puzzle
        </button>
      </div>
    </div>
  );
}
