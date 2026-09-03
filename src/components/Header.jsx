function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function Cog() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 1.9 13.8 4a8 8 0 0 1 1.9.8l2.7-.7 1.7 2.9-1.8 2.1c.1.4.1.8.1 1.2s0 .8-.1 1.2l1.8 2.1-1.7 2.9-2.7-.7a8 8 0 0 1-1.9.8L12 22.1 10.2 20a8 8 0 0 1-1.9-.8l-2.7.7-1.7-2.9 1.8-2.1a7.6 7.6 0 0 1 0-2.4L3.9 7.1 5.6 4.2l2.7.7A8 8 0 0 1 10.2 4z"
      />
      <circle cx="12" cy="12" r="3.4" fill="var(--surface)" />
    </svg>
  );
}

export default function Header({
  level,
  difficulty,
  size,
  seconds,
  paused,
  onTogglePause,
  onOpenSettings,
  onOpenLevels
}) {
  return (
    <header className="header">
      <div className="brand">
        <h1>SudoNeko</h1>
        <span>
          Level {level} · {difficulty} · {size}×{size}
        </span>
      </div>
      <div className="header-middle">
        <button type="button" className="pill-button small" onPointerDown={onOpenLevels}>
          Levels
        </button>
      </div>
      <div className="header-right">
        <button type="button" className="icon-button" aria-label={paused ? 'Resume' : 'Pause'} onPointerDown={onTogglePause}>
          {paused ? (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M8 5.5 L18 12 L8 18.5 Z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <rect x="7" y="5.5" width="3.6" height="13" rx="1.4" />
              <rect x="13.4" y="5.5" width="3.6" height="13" rx="1.4" />
            </svg>
          )}
        </button>
        <div className="pill">{formatTime(seconds)}</div>
        <button type="button" className="icon-button" aria-label="Settings" onPointerDown={onOpenSettings}>
          <Cog />
        </button>
      </div>
    </header>
  );
}

export { formatTime };
