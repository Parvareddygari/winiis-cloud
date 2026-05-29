/* w.inii's cloud — Sticker library
   Cute hand-drawn SVG stickers grouped into 3 tabs:
     - pandas  (re-uses your existing /assets/panda-*.svg files via PANDA_URLS)
     - beach   (sun, palm, shell, wave, sailboat, starfish)
     - sweets  (strawberry, chocolate, cupcake, ice cream, cookie, donut)

   Each sticker is a small React component rendering inline SVG at any size.
   The canvas / paint-editor calls `renderStickerToDataURL(key, size)` to get
   a PNG data URL it can place on the canvas as a movable sticker.
*/

// ─── pandas (existing assets) ──────────────────────────────────────────
// Only keys that actually exist in window.PANDA_URLS — filtered at runtime
// so a missing asset can never crash the sticker palette.
const PANDA_KEYS = ['hi', 'love', 'sleepy', 'float', 'beach', 'thinking']
  .filter(k => (window.PANDA_URLS || {})[k]);

const PandaStickerImg = ({ name, size = 80 }) => {
  const src = (window.PANDA_URLS || {})[name];
  if (!src) return null;
  return (
    <img src={src} alt={name}
      width={size} height={size}
      style={{ display: 'block', pointerEvents: 'none' }}/>
  );
};

// ─── beach stickers ────────────────────────────────────────────────────
const SunSticker = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <g stroke="#E8A547" strokeWidth="3" strokeLinecap="round">
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i * Math.PI * 2) / 8;
        const x1 = 50 + Math.cos(a) * 28;
        const y1 = 50 + Math.sin(a) * 28;
        const x2 = 50 + Math.cos(a) * 42;
        const y2 = 50 + Math.sin(a) * 42;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}/>;
      })}
    </g>
    <circle cx="50" cy="50" r="22" fill="#FCD34D" stroke="#E8A547" strokeWidth="2"/>
    <circle cx="44" cy="46" r="2.4" fill="#7A4A1A"/>
    <circle cx="56" cy="46" r="2.4" fill="#7A4A1A"/>
    <path d="M 43 56 Q 50 62 57 56" stroke="#7A4A1A" strokeWidth="2" fill="none" strokeLinecap="round"/>
  </svg>
);

const PalmSticker = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path d="M 50 90 Q 48 70 52 50 Q 54 38 50 30" stroke="#8B5A2B" strokeWidth="6" fill="none" strokeLinecap="round"/>
    <g fill="#3FA76E" stroke="#1F7A4D" strokeWidth="1.5">
      <ellipse cx="38" cy="22" rx="18" ry="6" transform="rotate(-20 38 22)"/>
      <ellipse cx="62" cy="22" rx="18" ry="6" transform="rotate(20 62 22)"/>
      <ellipse cx="28" cy="32" rx="20" ry="6" transform="rotate(-5 28 32)"/>
      <ellipse cx="72" cy="32" rx="20" ry="6" transform="rotate(5 72 32)"/>
    </g>
    <circle cx="50" cy="28" r="3" fill="#8B5A2B"/>
    <circle cx="46" cy="32" r="2.5" fill="#A0653A"/>
    <circle cx="54" cy="33" r="2.5" fill="#A0653A"/>
  </svg>
);

const ShellSticker = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <defs>
      <radialGradient id="shellGrad" cx="50%" cy="90%" r="80%">
        <stop offset="0%" stopColor="#FFD9C9"/>
        <stop offset="100%" stopColor="#F08A6C"/>
      </radialGradient>
    </defs>
    <path d="M 18 78 Q 20 28 50 22 Q 80 28 82 78 Z" fill="url(#shellGrad)" stroke="#C46A52" strokeWidth="2"/>
    <g stroke="#C46A52" strokeWidth="1.5" fill="none" strokeLinecap="round">
      <path d="M 50 24 L 50 76"/>
      <path d="M 40 28 Q 38 50 32 76"/>
      <path d="M 60 28 Q 62 50 68 76"/>
      <path d="M 30 36 Q 24 56 22 76"/>
      <path d="M 70 36 Q 76 56 78 76"/>
    </g>
  </svg>
);

const WaveSticker = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path d="M 8 60 Q 22 46 36 60 T 64 60 T 92 60 L 92 88 L 8 88 Z" fill="#5B9AA0" stroke="#3D6E73" strokeWidth="2"/>
    <path d="M 8 70 Q 22 56 36 70 T 64 70 T 92 70" fill="none" stroke="#C9E2EC" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M 18 78 Q 28 72 38 78" fill="none" stroke="#FEFBF5" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
    <path d="M 58 78 Q 68 72 78 78" fill="none" stroke="#FEFBF5" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
  </svg>
);

const SailboatSticker = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <line x1="50" y1="20" x2="50" y2="62" stroke="#5C3A1F" strokeWidth="3" strokeLinecap="round"/>
    <path d="M 50 22 L 50 60 L 28 60 Z" fill="#FEFBF5" stroke="#2E3D44" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M 52 30 L 72 56 L 52 56 Z" fill="#E87966" stroke="#B85648" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M 18 68 Q 22 78 50 80 Q 78 78 82 68 Z" fill="#8B5A2B" stroke="#5C3A1F" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M 8 86 Q 24 80 40 86 T 72 86 T 96 86" fill="none" stroke="#5B9AA0" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const StarfishSticker = ({ size = 80 }) => {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 36 : 14;
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    pts.push(`${50 + Math.cos(a) * r},${50 + Math.sin(a) * r}`);
  }
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <polygon points={pts.join(' ')} fill="#F8A06B" stroke="#C46A52" strokeWidth="2" strokeLinejoin="round"/>
      <circle cx="38" cy="44" r="2" fill="#C46A52"/>
      <circle cx="62" cy="44" r="2" fill="#C46A52"/>
      <circle cx="50" cy="56" r="2" fill="#C46A52"/>
      <circle cx="42" cy="62" r="1.5" fill="#C46A52"/>
      <circle cx="58" cy="62" r="1.5" fill="#C46A52"/>
    </svg>
  );
};

// ─── sweets ────────────────────────────────────────────────────────────
const StrawberrySticker = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path d="M 50 28 Q 24 32 28 56 Q 32 86 50 92 Q 68 86 72 56 Q 76 32 50 28 Z" fill="#E54B5A" stroke="#A82F3D" strokeWidth="2"/>
    {[[38,46],[52,44],[64,48],[42,58],[56,58],[46,68],[60,68],[50,80]].map(([x,y],i) => (
      <g key={i} transform={`translate(${x} ${y})`}>
        <ellipse cx="0" cy="0" rx="2.2" ry="3.4" fill="#FCD34D" stroke="#A82F3D" strokeWidth="0.5"/>
      </g>
    ))}
    <g fill="#3FA76E" stroke="#1F7A4D" strokeWidth="1.5">
      <path d="M 50 30 L 42 18 L 50 22 L 58 18 L 50 30 Z"/>
      <path d="M 38 24 L 50 28 L 42 16 Z"/>
      <path d="M 62 24 L 50 28 L 58 16 Z"/>
    </g>
  </svg>
);

const ChocolateSticker = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <rect x="20" y="22" width="60" height="56" rx="4" fill="#6B3A1A" stroke="#3F2010" strokeWidth="2"/>
    <g stroke="#3F2010" strokeWidth="1.5" fill="none">
      <line x1="40" y1="22" x2="40" y2="78"/>
      <line x1="60" y1="22" x2="60" y2="78"/>
      <line x1="20" y1="40" x2="80" y2="40"/>
      <line x1="20" y1="60" x2="80" y2="60"/>
    </g>
    {[[30,31],[50,31],[70,31],[30,50],[50,50],[70,50],[30,69],[50,69],[70,69]].map(([x,y],i) => (
      <circle key={i} cx={x} cy={y} r="3" fill="#8B5A2B" opacity="0.6"/>
    ))}
    <path d="M 18 18 L 22 22 L 30 18 L 34 22 L 42 18 L 46 22 L 54 18 L 58 22 L 66 18 L 70 22 L 78 18 L 82 22" stroke="#C9C9C9" strokeWidth="2" fill="none"/>
  </svg>
);

const CupcakeSticker = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path d="M 28 52 L 32 88 L 68 88 L 72 52 Z" fill="#E87966" stroke="#B85648" strokeWidth="2" strokeLinejoin="round"/>
    <g stroke="#B85648" strokeWidth="1.2" fill="none">
      <line x1="40" y1="54" x2="42" y2="86"/>
      <line x1="50" y1="54" x2="50" y2="86"/>
      <line x1="60" y1="54" x2="58" y2="86"/>
    </g>
    <path d="M 24 52 Q 26 32 50 28 Q 74 32 76 52 Q 72 50 64 52 Q 56 44 50 52 Q 44 44 36 52 Q 28 50 24 52 Z" fill="#FFC4D6" stroke="#D88AA8" strokeWidth="2"/>
    <circle cx="50" cy="34" r="4" fill="#E54B5A" stroke="#A82F3D" strokeWidth="1.5"/>
    <path d="M 50 30 Q 52 26 56 28" stroke="#3FA76E" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <g fill="#FCD34D">
      <circle cx="36" cy="42" r="1.5"/>
      <circle cx="62" cy="44" r="1.5"/>
      <circle cx="44" cy="48" r="1.5"/>
      <circle cx="58" cy="48" r="1.5"/>
    </g>
  </svg>
);

const IceCreamSticker = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path d="M 30 56 L 50 92 L 70 56 Z" fill="#D9A567" stroke="#8B5A2B" strokeWidth="2" strokeLinejoin="round"/>
    <g stroke="#8B5A2B" strokeWidth="1" fill="none">
      <line x1="34" y1="60" x2="46" y2="60"/>
      <line x1="38" y1="68" x2="52" y2="68"/>
      <line x1="42" y1="76" x2="56" y2="76"/>
      <line x1="46" y1="84" x2="58" y2="84"/>
    </g>
    <ellipse cx="50" cy="56" rx="22" ry="14" fill="#FFC4D6" stroke="#D88AA8" strokeWidth="2"/>
    <ellipse cx="50" cy="46" rx="18" ry="12" fill="#FEFBF5" stroke="#D9A8B8" strokeWidth="2"/>
    <ellipse cx="50" cy="36" rx="14" ry="10" fill="#A8D8C0" stroke="#5FA888" strokeWidth="2"/>
    <circle cx="50" cy="28" r="3" fill="#E54B5A" stroke="#A82F3D" strokeWidth="1"/>
    <path d="M 50 25 Q 52 22 55 23" stroke="#3FA76E" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
  </svg>
);

const CookieSticker = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="36" fill="#D9A567" stroke="#8B5A2B" strokeWidth="2"/>
    <g fill="#3F2010">
      <circle cx="36" cy="38" r="4"/>
      <circle cx="60" cy="34" r="3.5"/>
      <circle cx="42" cy="58" r="4.5"/>
      <circle cx="62" cy="56" r="3.5"/>
      <circle cx="52" cy="68" r="3"/>
      <circle cx="32" cy="50" r="2.5"/>
      <circle cx="68" cy="48" r="3"/>
    </g>
    <path d="M 28 28 Q 26 26 24 28" stroke="#8B5A2B" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M 74 38 Q 78 36 80 40" stroke="#8B5A2B" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
  </svg>
);

const DonutSticker = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="38" fill="#D9A567" stroke="#8B5A2B" strokeWidth="2"/>
    <path d="M 50 14 Q 86 18 86 50 Q 82 38 70 32 Q 64 22 50 18 Q 36 22 30 32 Q 18 38 14 50 Q 14 18 50 14 Z" fill="#FFC4D6" stroke="#D88AA8" strokeWidth="2"/>
    <g fill="#E54B5A">
      <rect x="32" y="22" width="3" height="6" rx="1" transform="rotate(-20 33.5 25)"/>
      <rect x="62" y="22" width="3" height="6" rx="1" transform="rotate(15 63.5 25)"/>
    </g>
    <g fill="#5FA888">
      <rect x="24" y="32" width="3" height="6" rx="1" transform="rotate(-40 25.5 35)"/>
      <rect x="72" y="34" width="3" height="6" rx="1" transform="rotate(30 73.5 37)"/>
    </g>
    <g fill="#FCD34D">
      <rect x="42" y="18" width="3" height="6" rx="1"/>
      <rect x="56" y="18" width="3" height="6" rx="1" transform="rotate(8 57.5 21)"/>
    </g>
    <circle cx="50" cy="50" r="12" fill="#FEFBF5" stroke="#8B5A2B" strokeWidth="2"/>
  </svg>
);

// ─── catalog ───────────────────────────────────────────────────────────
const STICKERS = {
  pandas: PANDA_KEYS.map(k => ({ key: `panda-${k}`, label: k, kind: 'panda', name: k })),
  beach: [
    { key: 'sun',       label: 'sun',       kind: 'svg', Comp: SunSticker },
    { key: 'palm',      label: 'palm',      kind: 'svg', Comp: PalmSticker },
    { key: 'shell',     label: 'shell',     kind: 'svg', Comp: ShellSticker },
    { key: 'wave',      label: 'wave',      kind: 'svg', Comp: WaveSticker },
    { key: 'sailboat',  label: 'sailboat',  kind: 'svg', Comp: SailboatSticker },
    { key: 'starfish',  label: 'starfish',  kind: 'svg', Comp: StarfishSticker },
  ],
  sweets: [
    { key: 'strawberry', label: 'strawberry', kind: 'svg', Comp: StrawberrySticker },
    { key: 'chocolate',  label: 'chocolate',  kind: 'svg', Comp: ChocolateSticker },
    { key: 'cupcake',    label: 'cupcake',    kind: 'svg', Comp: CupcakeSticker },
    { key: 'icecream',   label: 'ice cream',  kind: 'svg', Comp: IceCreamSticker },
    { key: 'cookie',     label: 'cookie',     kind: 'svg', Comp: CookieSticker },
    { key: 'donut',      label: 'donut',      kind: 'svg', Comp: DonutSticker },
  ],
};

// Render any sticker by key as inline JSX (for palette buttons + on-canvas preview).
const renderSticker = (key, size = 56) => {
  for (const group of Object.values(STICKERS)) {
    const s = group.find(x => x.key === key);
    if (!s) continue;
    if (s.kind === 'panda') return <PandaStickerImg name={s.name} size={size}/>;
    if (s.kind === 'svg')  { const C = s.Comp; return <C size={size}/>; }
  }
  return null;
};

// Render a sticker to a PNG data URL (used when flattening canvas on save).
const stickerToDataURL = async (key, size = 200) => {
  // Render the sticker JSX into a temporary container, grab its <svg>, serialize, load as <img>
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;left:-9999px;top:-9999px;';
  document.body.appendChild(host);
  try {
    const root = ReactDOM.createRoot(host);
    await new Promise(res => {
      root.render(renderSticker(key, size));
      requestAnimationFrame(() => requestAnimationFrame(res));
    });
    // Two paths: <svg> (for SVG stickers) or <img> (for panda stickers)
    const svg = host.querySelector('svg');
    const img = host.querySelector('img');
    let url;
    if (svg) {
      const ser = new XMLSerializer().serializeToString(svg);
      url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(ser);
    } else if (img) {
      url = img.src;
    } else {
      throw new Error('sticker render failed: ' + key);
    }
    return url;
  } finally {
    setTimeout(() => host.remove(), 0);
  }
};

Object.assign(window, { STICKERS, renderSticker, stickerToDataURL });
