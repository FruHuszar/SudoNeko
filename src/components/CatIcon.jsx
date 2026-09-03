export const PATTERNS = [
  'plain',
  'patch',
  'stripes',
  'spots',
  'mask',
  'star',
  'panel',
  'fluff',
  'belly',
  'socks',
  'heart',
  'collar',
  'moon',
  'freckles'
];

export const EYE_SHAPES = ['round', 'almond', 'wide', 'sleepy', 'starry', 'wink'];

export const FURS = [
  '#fff3e2', '#3a3444', '#f4e6d5', '#f6a94a', '#ccd3dc', '#6f55ad', '#ffd9e6',
  '#a8dcd1', '#c9b7a0', '#8fb3e0', '#f7c8a0', '#d8e8a8', '#e9d5f5'
];

export const MARKINGS = [
  '#f6a03c', '#4a3f44', '#6d5546', '#98a2b1', '#c9a7ff', '#7fd8e8', '#ff9fb2',
  '#e0d5ea', '#5f7f6a', '#d94f4f', '#3f6ea8', '#f2d64b', '#a06c3f'
];

export const EYES = [
  '#4a3f44', '#ffd166', '#5cb1e8', '#4b8a58', '#2ec8de', '#7c6ce7',
  '#e26d8a', '#f28f3b', '#9be36f', '#ff5d5d', '#00b894', '#b8b8c8'
];

export const EARS = [
  '#ffbfc9', '#7d5f83', '#e3a9a0', '#ffc3b0', '#7fd8e8', '#c9a7ff',
  '#ffd9a8', '#f58fb0', '#9ed6b8', '#d0c3a8', '#ff7f7f', '#cfd8e8'
];

export const SKINS = [
  { id: 'calico', name: 'Calico', wins: 0, pattern: 'patch', eyeShape: 'round', body: '#fff3e2', shade: '#f6a03c', dark: '#4a3f44', ear: '#ffbfc9', eye: '#4a3f44' },
  { id: 'shadow', name: 'Shadow', wins: 2, pattern: 'plain', eyeShape: 'wide', body: '#3a3444', shade: '#4d465c', dark: '#2a2532', ear: '#7d5f83', eye: '#ffd166' },
  { id: 'siamese', name: 'Siamese', wins: 5, pattern: 'mask', eyeShape: 'almond', body: '#f4e6d5', shade: '#6d5546', dark: '#6d5546', ear: '#e3a9a0', eye: '#5cb1e8' },
  { id: 'tabby', name: 'Tabby', wins: 10, pattern: 'stripes', eyeShape: 'round', body: '#f6a94a', shade: '#cd7c24', dark: '#8a4f16', ear: '#ffc3b0', eye: '#4b8a58' },
  { id: 'robot', name: 'Robo', wins: 25, pattern: 'panel', eyeShape: 'wide', body: '#ccd3dc', shade: '#98a2b1', dark: '#5c6675', ear: '#7fd8e8', eye: '#2ec8de' },
  { id: 'cosmic', name: 'Cosmic', wins: 50, pattern: 'star', eyeShape: 'starry', body: '#6f55ad', shade: '#4c3a7d', dark: '#33255a', ear: '#c9a7ff', eye: '#fff3b0' },
  { id: 'persian', name: 'Persian', wins: 100, pattern: 'fluff', eyeShape: 'sleepy', body: '#fffdfa', shade: '#e8dff0', dark: '#b9aec6', ear: '#ffc8d8', eye: '#7c6ce7' }
];

export const CUSTOM_WINS = 5;

export const DEFAULT_CUSTOM = {
  body: '#ffd9e6',
  shade: '#ff9fb2',
  ear: '#ffc3b0',
  eye: '#7c6ce7',
  pattern: 'spots',
  eyeShape: 'round'
};

export function getSkin(id, custom) {
  if (id === 'custom') return { id: 'custom', name: 'Your cat', wins: CUSTOM_WINS, dark: '#3f3548', ...DEFAULT_CUSTOM, ...custom };
  return SKINS.find((skin) => skin.id === id) || SKINS[0];
}

export function isUnlocked(id, wins) {
  if (id === 'custom') return wins >= CUSTOM_WINS;
  return wins >= getSkin(id).wins;
}

export function requiredWins(id) {
  return id === 'custom' ? CUSTOM_WINS : getSkin(id).wins;
}

export function unlocksAt(wins) {
  const names = SKINS.filter((skin) => skin.wins === wins).map((skin) => skin.name);
  if (wins === CUSTOM_WINS) names.push('your own design');
  return names;
}

function Pattern({ skin }) {
  const p = skin.pattern;

  if (p === 'patch') {
    return (
      <g>
        <path d="M32 12 q12 2 14 14 q-7 -5 -14 -4 z" fill={skin.shade} />
        <ellipse cx="21" cy="45" rx="7" ry="8" fill={skin.dark} opacity="0.85" />
        <ellipse cx="43" cy="47" rx="6" ry="6" fill={skin.shade} />
      </g>
    );
  }
  if (p === 'mask') {
    return (
      <g>
        <ellipse cx="32" cy="28" rx="11" ry="9" fill={skin.shade} opacity="0.9" />
        <ellipse cx="32" cy="55" rx="12" ry="6" fill={skin.shade} opacity="0.35" />
      </g>
    );
  }
  if (p === 'stripes') {
    return (
      <g fill="none" stroke={skin.shade} strokeWidth="3" strokeLinecap="round">
        <path d="M26 12 L28 18" />
        <path d="M32 10 L32 17" />
        <path d="M38 12 L36 18" />
        <path d="M18 42 L24 44" />
        <path d="M18 50 L24 51" />
        <path d="M46 42 L40 44" />
        <path d="M46 50 L40 51" />
      </g>
    );
  }
  if (p === 'spots') {
    return (
      <g fill={skin.shade}>
        <circle cx="22" cy="44" r="3.6" />
        <circle cx="32" cy="50" r="3" />
        <circle cx="42" cy="44" r="3.6" />
        <circle cx="27" cy="53" r="2.4" />
        <circle cx="38" cy="54" r="2.4" />
        <circle cx="42" cy="19" r="3" />
      </g>
    );
  }
  if (p === 'panel') {
    return (
      <g>
        <rect x="30" y="2" width="4" height="9" rx="2" fill={skin.shade} />
        <circle cx="32" cy="2" r="3.4" fill={skin.ear} />
        <rect x="22" y="40" width="20" height="12" rx="4" fill={skin.shade} />
        <circle cx="27" cy="46" r="2.4" fill={skin.eye} />
        <circle cx="37" cy="46" r="2.4" fill={skin.eye} />
      </g>
    );
  }
  if (p === 'star') {
    return (
      <g fill={skin.shade}>
        <path d="M22 42 l1.6 3.4 3.6.4-2.7 2.5.8 3.6-3.3-1.9-3.3 1.9.8-3.6-2.7-2.5 3.6-.4z" />
        <circle cx="41" cy="44" r="2" />
        <circle cx="45" cy="51" r="1.4" />
        <circle cx="36" cy="53" r="1.6" />
      </g>
    );
  }
  if (p === 'fluff') {
    return (
      <g fill={skin.shade}>
        <circle cx="17" cy="30" r="6" />
        <circle cx="47" cy="30" r="6" />
        <ellipse cx="32" cy="50" rx="13" ry="9" />
      </g>
    );
  }
  if (p === 'belly') {
    return (
      <g fill={skin.shade}>
        <ellipse cx="32" cy="49" rx="13" ry="10" opacity="0.75" />
        <path d="M24 57 q8 3 16 0" fill="none" stroke={skin.shade} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      </g>
    );
  }
  if (p === 'socks') {
    return (
      <g fill={skin.shade}>
        <rect x="19" y="50" width="10" height="9" rx="4.5" />
        <rect x="35" y="50" width="10" height="9" rx="4.5" />
        <ellipse cx="32" cy="20" rx="5" ry="4" opacity="0.8" />
      </g>
    );
  }
  if (p === 'heart') {
    return (
      <g fill={skin.shade}>
        <path d="M32 55 q-9 -6 -9 -12 a4.6 4.6 0 0 1 9 -2.4 a4.6 4.6 0 0 1 9 2.4 q0 6 -9 12 z" />
      </g>
    );
  }
  if (p === 'collar') {
    return (
      <path
        d="M18 36.3 Q32 48.8 46 36.3 L49.9 40.6 L44.5 40.3 L43.1 45.4 L38.3 43.6 L35.8 48 L32 44.8 L28.2 48 L25.7 43.6 L20.9 45.4 L19.5 40.3 L14.1 40.6 Z"
        fill={skin.shade}
        stroke={skin.shade}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    );
  }
  if (p === 'moon') {
    return (
      <g fill={skin.shade}>
        <path d="M44 14 a8 8 0 1 0 3 12 a6.5 6.5 0 0 1 -3 -12 z" />
        <ellipse cx="32" cy="50" rx="10" ry="7" opacity="0.5" />
      </g>
    );
  }
  if (p === 'freckles') {
    return (
      <g fill={skin.shade}>
        <circle cx="24" cy="34" r="1.5" />
        <circle cx="21" cy="31" r="1.3" />
        <circle cx="27" cy="31" r="1.2" />
        <circle cx="40" cy="34" r="1.5" />
        <circle cx="43" cy="31" r="1.3" />
        <circle cx="37" cy="31" r="1.2" />
        <ellipse cx="32" cy="50" rx="11" ry="8" opacity="0.4" />
      </g>
    );
  }
  return <ellipse cx="32" cy="49" rx="11" ry="8" fill={skin.shade} opacity="0.6" />;
}

function Eyes({ skin }) {
  const shape = skin.eyeShape || 'round';
  const color = skin.eye;

  if (shape === 'almond') {
    return (
      <g fill={color}>
        <path d="M20 26 q4 -4.5 8 0 q-4 4.5 -8 0 z" />
        <path d="M36 26 q4 -4.5 8 0 q-4 4.5 -8 0 z" />
      </g>
    );
  }
  if (shape === 'wide') {
    return (
      <g>
        <circle cx="24" cy="26" r="4.4" fill={color} />
        <circle cx="40" cy="26" r="4.4" fill={color} />
        <circle cx="25.4" cy="24.6" r="1.5" fill="#ffffff" opacity="0.85" />
        <circle cx="41.4" cy="24.6" r="1.5" fill="#ffffff" opacity="0.85" />
      </g>
    );
  }
  if (shape === 'sleepy') {
    return (
      <g fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round">
        <path d="M20.5 26.5 q3.5 3 7 0" />
        <path d="M36.5 26.5 q3.5 3 7 0" />
      </g>
    );
  }
  if (shape === 'starry') {
    return (
      <g fill={color}>
        <path d="M24 21.5 l1.5 3.3 3.5.4-2.6 2.4.7 3.5-3.1-1.8-3.1 1.8.7-3.5-2.6-2.4 3.5-.4z" />
        <path d="M40 21.5 l1.5 3.3 3.5.4-2.6 2.4.7 3.5-3.1-1.8-3.1 1.8.7-3.5-2.6-2.4 3.5-.4z" />
      </g>
    );
  }
  if (shape === 'wink') {
    return (
      <g>
        <ellipse cx="24" cy="26" rx="3" ry="3.6" fill={color} />
        <path d="M36.5 27 q3.5 -3.5 7 0" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g fill={color}>
      <ellipse cx="24" cy="26" rx="3" ry="3.6" />
      <ellipse cx="40" cy="26" rx="3" ry="3.6" />
    </g>
  );
}

export default function CatIcon({ skinId, custom, className }) {
  const skin = getSkin(skinId, custom);

  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path d="M50 52 q12 2 10 -8" fill="none" stroke={skin.shade} strokeWidth="6" strokeLinecap="round" />
      <path d="M32 60 C 15 60 11 50 13 41 C 15 32 22 28 32 28 C 42 28 49 32 51 41 C 53 50 49 60 32 60 Z" fill={skin.body} />
      <path d="M15 26 L18 8 L31 17 Z" fill={skin.body} />
      <path d="M49 26 L46 8 L33 17 Z" fill={skin.body} />
      <path d="M19 22 L21 13 L28 18 Z" fill={skin.ear} />
      <path d="M45 22 L43 13 L36 18 Z" fill={skin.ear} />
      <ellipse cx="32" cy="27" rx="19" ry="15" fill={skin.body} />
      <Pattern skin={skin} />
      <Eyes skin={skin} />
      <path d="M29 33 h6 l-3 3 z" fill={skin.dark} />
      <g stroke={skin.dark} strokeWidth="1.6" strokeLinecap="round" opacity="0.7">
        <path d="M13 30 h7" />
        <path d="M13 35 h7" />
        <path d="M51 30 h-7" />
        <path d="M51 35 h-7" />
      </g>
    </svg>
  );
}
