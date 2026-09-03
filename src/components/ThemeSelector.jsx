import CatIcon, { CUSTOM_WINS, SKINS, isUnlocked, requiredWins } from './CatIcon';

export const THEMES = [
  { id: 'blueberry', name: 'Blueberry milk', top: '#ebe9ff', bottom: '#b9c9ff' },
  { id: 'sorbet', name: 'Peach sorbet', top: '#ffeade', bottom: '#ffc6cf' },
  { id: 'matcha', name: 'Matcha', top: '#e6f0dc', bottom: '#cfe8b6' },
  { id: 'sakura', name: 'Sakura', top: '#ffe9f1', bottom: '#ffc9de' },
  { id: 'midnight', name: 'Midnight', top: '#23253f', bottom: '#7ce0c3' },
  { id: 'cocoa', name: 'Cocoa', top: '#f0e3d6', bottom: '#e8c9a8' },
  { id: 'citrus', name: 'Citrus', top: '#fff3d1', bottom: '#ffd79a' }
];

function Lock({ wins }) {
  return (
    <span className="lock">
      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <rect x="5" y="10.5" width="14" height="9.5" rx="2.5" fill="currentColor" stroke="none" />
        <path d="M8.5 10.5 V7.5 a3.5 3.5 0 0 1 7 0 v3" />
      </svg>
      {wins} wins
    </span>
  );
}

export default function ThemeSelector({ theme, skin, custom, wins, onTheme, onSkin, onEditCustom, onClose }) {
  const customOpen = wins >= CUSTOM_WINS;

  return (
    <div className="sheet-backdrop" onPointerDown={onClose}>
      <div className="sheet" onPointerDown={(event) => event.stopPropagation()}>
        <h2>Cats and colours</h2>
        <p className="sheet-label">Colours</p>
        <div className="swatches">
          {THEMES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`swatch${theme === item.id ? ' active' : ''}`}
              aria-label={item.name}
              onPointerDown={() => onTheme(item.id)}
            >
              <span className="swatch-stripes">
                <span style={{ background: item.top }} />
                <span style={{ background: item.bottom }} />
              </span>
            </button>
          ))}
        </div>

        <p className="sheet-label">Cats · {wins} {wins === 1 ? 'level' : 'levels'} solved</p>
        <div className="skins">
          {SKINS.map((item) => {
            const open = isUnlocked(item.id, wins);
            return (
              <button
                key={item.id}
                type="button"
                className={`skin-choice${skin === item.id ? ' active' : ''}${open ? '' : ' locked'}`}
                aria-label={open ? item.name : `${item.name}, unlocks after ${item.wins} wins`}
                onPointerDown={() => open && onSkin(item.id)}
              >
                <CatIcon skinId={item.id} className="cat" />
                {open ? <span className="skin-name">{item.name}</span> : <Lock wins={requiredWins(item.id)} />}
              </button>
            );
          })}

          <button
            type="button"
            className={`skin-choice${skin === 'custom' ? ' active' : ''}${customOpen ? '' : ' locked'}`}
            aria-label={customOpen ? 'Design your own cat' : `Your own cat, unlocks after ${CUSTOM_WINS} wins`}
            onPointerDown={() => {
              if (!customOpen) return;
              onSkin('custom');
              onEditCustom();
            }}
          >
            <CatIcon skinId="custom" custom={custom} className="cat" />
            {customOpen ? <span className="skin-name">Make one</span> : <Lock wins={CUSTOM_WINS} />}
          </button>
        </div>

        <button type="button" className="pill-button accent" onPointerDown={onClose}>
          Back to the puzzle
        </button>
      </div>
    </div>
  );
}
