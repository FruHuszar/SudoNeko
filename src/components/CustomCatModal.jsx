import CatIcon, { EARS, EYES, EYE_SHAPES, FURS, MARKINGS, PATTERNS } from './CatIcon';

const PATTERN_NAMES = {
  plain: 'Plain',
  patch: 'Patches',
  stripes: 'Stripes',
  spots: 'Spots',
  mask: 'Mask',
  star: 'Stars',
  panel: 'Panel',
  fluff: 'Fluffy',
  belly: 'Belly',
  socks: 'Socks',
  heart: 'Heart',
  collar: 'Ruff',
  moon: 'Moon',
  freckles: 'Freckles'
};

const SHAPE_NAMES = {
  round: 'Round',
  almond: 'Almond',
  wide: 'Wide',
  sleepy: 'Sleepy',
  starry: 'Starry',
  wink: 'Wink'
};

const TRAITS = [
  { key: 'body', label: 'Fur', options: FURS, kind: 'colour' },
  { key: 'pattern', label: 'Markings', options: PATTERNS, kind: 'pattern' },
  { key: 'shade', label: 'Marking colour', options: MARKINGS, kind: 'colour' },
  { key: 'eye', label: 'Eye colour', options: EYES, kind: 'colour' },
  { key: 'eyeShape', label: 'Eye shape', options: EYE_SHAPES, kind: 'shape' },
  { key: 'ear', label: 'Ears', options: EARS, kind: 'colour' }
];

function step(options, current, direction) {
  const at = options.indexOf(current);
  const start = at === -1 ? 0 : at;
  return options[(start + direction + options.length) % options.length];
}

function Arrow({ direction, onPress, label }) {
  return (
    <button type="button" className="arrow" aria-label={label} onPointerDown={onPress}>
      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path d={direction < 0 ? 'M14 6 L8 12 L14 18' : 'M10 6 L16 12 L10 18'} />
      </svg>
    </button>
  );
}

function Value({ trait, custom }) {
  const value = custom[trait.key];
  if (trait.kind === 'pattern') return PATTERN_NAMES[value];
  if (trait.kind === 'shape') return SHAPE_NAMES[value];
  return <span className="trait-dot" style={{ background: value }} />;
}

export default function CustomCatModal({ custom, onChange, onClose }) {
  const change = (trait, direction) => {
    onChange({ ...custom, [trait.key]: step(trait.options, custom[trait.key], direction) });
  };

  return (
    <div className="modal-backdrop" onPointerDown={onClose}>
      <div className="modal editor" onPointerDown={(event) => event.stopPropagation()}>
        <h2>Design your cat</h2>
        <div className="editor-grid">
          {TRAITS.map((trait, row) => (
            <div className="trait-side left" key={`${trait.key}-l`} style={{ gridRow: row + 1 }}>
              <span className="trait-label">{trait.label}</span>
              <Arrow direction={-1} label={`Previous ${trait.label}`} onPress={() => change(trait, -1)} />
            </div>
          ))}

          <div className="editor-cat">
            <CatIcon skinId="custom" custom={custom} className="preview-cat" />
          </div>

          {TRAITS.map((trait, row) => (
            <div className="trait-side right" key={`${trait.key}-r`} style={{ gridRow: row + 1 }}>
              <Arrow direction={1} label={`Next ${trait.label}`} onPress={() => change(trait, 1)} />
              <span className="trait-value">
                <Value trait={trait} custom={custom} />
              </span>
            </div>
          ))}
        </div>
        <button type="button" className="pill-button accent" onPointerDown={onClose}>
          Take this cat home
        </button>
      </div>
    </div>
  );
}
