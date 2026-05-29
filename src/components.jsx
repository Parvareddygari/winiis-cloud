/* w.inii's cloud — shared atomic components
   Exports all to window so other Babel scripts can use them. */

// ──────────────────────────────────────────────────────────────────────
// SVG icon set — Lucide-style 1.5 stroke (hand-drawn inline)
// ──────────────────────────────────────────────────────────────────────

const Icon = ({ name, size = 20, ...rest }) => {
  const paths = ICONS[name] || ICONS.help;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...rest}>
      {paths}
    </svg>
  );
};

const ICONS = {
  plus:        <><path d="M12 5v14M5 12h14"/></>,
  x:           <><path d="M18 6L6 18M6 6l12 12"/></>,
  chevronL:    <><path d="M15 18l-6-6 6-6"/></>,
  chevronR:    <><path d="M9 18l6-6-6-6"/></>,
  chevronD:    <><path d="M6 9l6 6 6-6"/></>,
  calendar:    <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
  more:        <><circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/></>,
  lock:        <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></>,
  download:    <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
  upload:      <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>,
  link:        <><path d="M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1"/><path d="M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1"/></>,
  instagram:   <><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.7" fill="currentColor"/></>,
  trash:       <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></>,
  edit:        <><path d="M17 3a2.8 2.8 0 014 4L8 20l-5 1 1-5z"/></>,
  image:       <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></>,
  filter:      <><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></>,
  search:      <><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
  grid:        <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>,
  scatter:     <><rect x="3" y="5" width="6" height="6" transform="rotate(-8 6 8)"/><rect x="13" y="3" width="6" height="6" transform="rotate(6 16 6)"/><rect x="8" y="13" width="6" height="6" transform="rotate(-4 11 16)"/><rect x="15" y="14" width="6" height="6" transform="rotate(10 18 17)"/></>,
  stream:      <><rect x="6" y="3" width="12" height="6" rx="1"/><rect x="6" y="11" width="12" height="6" rx="1"/><rect x="6" y="19" width="12" height="2" rx="1"/></>,
  help:        <><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 015.8 1c0 2-3 3-3 3M12 17h.01"/></>,
};

// ──────────────────────────────────────────────────────────────────────
// Cloud glyph + Wordmark + Logo lockup
// ──────────────────────────────────────────────────────────────────────

const CloudGlyph = ({ size = 56, withPanda = true }) => (
  <svg width={size} height={size * 0.65} viewBox="-60 -40 120 80">
    <ellipse cx="0" cy="4" rx="58" ry="34" fill="#C9E2EC" opacity="0.4"/>
    <path d="M -38 8 C -50 8, -50 -10, -36 -12 C -34 -24, -16 -28, -8 -20 C 0 -32, 22 -30, 26 -18 C 38 -22, 48 -10, 42 0 C 50 4, 48 14, 38 14 L -36 14 C -48 14, -50 8, -38 8 Z"
      fill="#FEFBF5" stroke="#2E3D44" strokeWidth="2" strokeLinejoin="round"/>
    {withPanda && (
      <g transform="translate(2, -2)">
        <circle cx="-8" cy="-8" r="4" fill="#1F2429"/>
        <circle cx="8" cy="-8" r="4" fill="#1F2429"/>
        <circle cx="0" cy="-2" r="9" fill="#FEFBF5" stroke="#2E3D44" strokeWidth="1"/>
        <ellipse cx="-3.5" cy="-2" rx="2.5" ry="3" fill="#1F2429" transform="rotate(-15 -3.5 -2)"/>
        <ellipse cx="3.5" cy="-2" rx="2.5" ry="3" fill="#1F2429" transform="rotate(15 3.5 -2)"/>
        <circle cx="-3.5" cy="-2.5" r="0.8" fill="#FEFBF5"/>
        <circle cx="3.5" cy="-2.5" r="0.8" fill="#FEFBF5"/>
        <ellipse cx="0" cy="1.5" rx="1" ry="0.7" fill="#1F2429"/>
        <path d="M -1.5 3 Q 0 4.5, 1.5 3" stroke="#1F2429" strokeWidth="0.7" fill="none" strokeLinecap="round"/>
      </g>
    )}
  </svg>
);

const Wordmark = ({ size = 40 }) => (
  <span style={{ font: `600 ${size}px/0.95 var(--wc-font-hand)`, color: 'var(--wc-ink)', whiteSpace: 'nowrap' }}>
    w.inii's cloud
  </span>
);

const Lockup = ({ glyphSize = 56, wordmarkSize = 40 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <CloudGlyph size={glyphSize}/>
    <Wordmark size={wordmarkSize}/>
  </div>
);

// ──────────────────────────────────────────────────────────────────────
// Button
// ──────────────────────────────────────────────────────────────────────

const Button = ({ variant = 'primary', size = 'md', icon, children, onClick, style, ...rest }) => {
  const sizes = {
    sm: { pad: '8px 16px', fs: 13 },
    md: { pad: '12px 22px', fs: 15 },
    lg: { pad: '14px 28px', fs: 16 },
  };
  const variants = {
    primary:   { bg: 'var(--wc-sea)', color: 'var(--wc-shell)', border: 'transparent' },
    coral:     { bg: 'var(--wc-coral)', color: 'var(--wc-shell)', border: 'transparent' },
    secondary: { bg: 'var(--wc-shell)', color: 'var(--wc-ink)', border: 'var(--wc-edge-strong)' },
    ghost:     { bg: 'transparent', color: 'var(--wc-ink-soft)', border: 'transparent' },
  };
  const v = variants[variant];
  const s = sizes[size];
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const hovered = hover && variant === 'primary' ? { bg: 'var(--wc-sea-deep)' }
                : hover && variant === 'coral'   ? { bg: '#DA7657' }
                : hover && variant === 'secondary' ? { bg: 'var(--wc-coral-tint)', border: 'var(--wc-coral-soft)' }
                : hover && variant === 'ghost'   ? { bg: 'var(--wc-sky)', color: 'var(--wc-ink)' }
                : {};
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)} onMouseUp={() => setPress(false)}
      style={{
        font: `600 ${s.fs}px/1 var(--wc-font-body)`,
        background: hovered.bg || v.bg,
        color: hovered.color || v.color,
        border: `1px solid ${hovered.border || v.border}`,
        borderRadius: 999,
        padding: s.pad,
        cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 8,
        transform: press ? 'scale(0.97)' : 'scale(1)',
        transition: 'all 220ms var(--wc-ease-standard), transform 120ms ease-in',
        ...style,
      }}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
};

const IconButton = ({ icon, onClick, label, style, ...rest }) => {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      aria-label={label}
      onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        width: 40, height: 40, borderRadius: 999,
        background: hover ? 'var(--wc-coral-soft)' : 'var(--wc-shell)',
        border: '1px solid var(--wc-edge-strong)', color: 'var(--wc-ink)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'all 220ms var(--wc-ease-standard)',
        ...style,
      }}
      {...rest}
    >
      {icon}
    </button>
  );
};

// ──────────────────────────────────────────────────────────────────────
// Polaroid — single photo card
// ──────────────────────────────────────────────────────────────────────

const Polaroid = ({ memory, rotation = 0, withTape = true, withStamp = true, onClick, size = 'md', layout = 'scattered', isOwner = false, onEditSticker }) => {
  const [hover, setHover] = React.useState(false);
  const w = size === 'lg' ? 240 : size === 'sm' ? 140 : 180;
  const ph = w; // square photo
  const cleanRotation = layout === 'grid' || layout === 'stream' ? 0 : rotation;
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'var(--wc-shell)',
        padding: '10px 10px 48px',
        border: '1px solid var(--wc-edge)',
        borderRadius: 4,
        boxShadow: hover ? 'var(--wc-shadow-lg)' : 'var(--wc-shadow-md)',
        width: w + 20,
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        transform: `${hover ? 'translateY(-3px) rotate(0deg)' : `rotate(${cleanRotation}deg)`}`,
        transition: 'all 280ms var(--wc-ease-pickup)',
      }}
    >
      {withTape && layout === 'scattered' && (
        <div style={{
          position: 'absolute', width: 60, height: 18,
          background: memory.tapeColor === 'coral' ? 'var(--wc-tape-coral)' : 'var(--wc-tape)',
          top: -8, left: '50%',
          transform: `translateX(-50%) rotate(${memory.tapeRot || -3}deg)`,
        }}/>
      )}
      <div
        onClick={onClick}
        style={{
          width: w, height: ph,
          background: memory.photoSrc ? `url(${memory.photoSrc}) center/cover` : (memory.photo || 'var(--wc-sand-2)'),
          borderRadius: 2,
          position: 'relative',
          overflow: 'hidden',
        }}>
        {!memory.photoSrc && memory.photoOverlay}
      </div>
      <div onClick={onClick} style={{
        font: '600 22px/1.05 var(--wc-font-hand)',
        color: 'var(--wc-ink)',
        marginTop: 12,
        textAlign: 'center',
        padding: '0 6px',
      }}>
        {memory.caption}
      </div>
      {layout === 'lightbox' && memory.location && (
        <div style={{
          font: '500 13px/1.3 var(--wc-font-body)',
          color: 'var(--wc-ink-soft)',
          textAlign: 'center',
          marginTop: 4,
          padding: '0 8px',
        }}>
          {memory.location}
        </div>
      )}
      {withStamp && (
        <div style={{
          position: 'absolute', bottom: 12, left: 14, right: 14,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
        }}>
          <span style={{ font: '400 10px/1 var(--wc-font-stamp)', color: 'var(--wc-ink-mute)', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
            {memory.month} · {memory.year}
          </span>
          {memory.location && layout !== 'lightbox' && (
            <span style={{ font: '400 10px/1 var(--wc-font-stamp)', color: 'var(--wc-ink-mute)', letterSpacing: '0.05em', whiteSpace: 'nowrap', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {memory.location}
            </span>
          )}
        </div>
      )}
      {/* Custom sticker overlay */}
      {memory.sticker && memory.sticker !== 'none' && (
        <img
          src={window.PANDA_URLS[memory.sticker]}
          alt=""
          width={size === 'lg' ? 72 : 56}
          height={size === 'lg' ? 72 : 56}
          style={{
            position: 'absolute',
            bottom: -14, right: -14,
            transform: `rotate(${memory.stickerRot || 12}deg)`,
            pointerEvents: 'none',
            filter: 'drop-shadow(0 4px 8px rgba(46,61,68,0.18))',
          }}
        />
      )}
      {/* Owner: sticker edit button */}
      {isOwner && onEditSticker && hover && (
        <button
          onClick={e => { e.stopPropagation(); onEditSticker(memory); }}
          style={{
            position: 'absolute', top: -10, right: -10,
            width: 32, height: 32, borderRadius: 999,
            background: 'var(--wc-shell)', border: '1.5px solid var(--wc-sea)',
            color: 'var(--wc-sea)', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--wc-shadow-md)',
            zIndex: 5,
          }}
          aria-label="add sticker"
          title="add a sticker"
        >
          <Icon name="plus" size={16}/>
        </button>
      )}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────
// Pill / chip
// ──────────────────────────────────────────────────────────────────────

const Pill = ({ children, tone = 'default', icon, onClick, active }) => {
  const tones = {
    default: { bg: 'var(--wc-shell)', color: 'var(--wc-ink-soft)', border: 'var(--wc-edge)' },
    sea:     { bg: 'var(--wc-sea)', color: 'var(--wc-shell)', border: 'transparent' },
    coral:   { bg: 'var(--wc-coral)', color: 'var(--wc-shell)', border: 'transparent' },
    sun:     { bg: 'var(--wc-sun-soft)', color: 'var(--wc-ink)', border: 'var(--wc-sun)' },
    foam:    { bg: 'var(--wc-foam)', color: 'var(--wc-sea-deep)', border: 'var(--wc-edge)' },
    stamp:   { bg: 'var(--wc-shell)', color: 'var(--wc-ink-mute)', border: 'var(--wc-edge)' },
  };
  const t = tones[active ? 'sea' : tone];
  return (
    <button
      onClick={onClick}
      style={{
        font: tone === 'stamp' ? '400 12px/1 var(--wc-font-stamp)' : '600 12px/1 var(--wc-font-body)',
        letterSpacing: tone === 'stamp' ? '0.06em' : '0.02em',
        textTransform: tone === 'stamp' ? 'uppercase' : 'none',
        padding: '9px 14px', borderRadius: 999,
        background: t.bg, color: t.color, border: `1px solid ${t.border}`,
        display: 'inline-flex', alignItems: 'center', gap: 6,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 220ms',
      }}
    >
      {icon}
      {children}
    </button>
  );
};

// ──────────────────────────────────────────────────────────────────────
// Header (top nav)
// ──────────────────────────────────────────────────────────────────────

const Header = ({ owner = 'chiraswinireddy', onLogin, onLogout, isOwner, onAdd, background, onSetBackground }) => (
  <header className="wc-header" style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 20px', borderBottom: '1px solid var(--wc-edge)',
    background: 'rgba(250,243,231,0.85)', backdropFilter: 'blur(14px)',
    position: 'sticky', top: 0, zIndex: 10,
    flexWrap: 'wrap', gap: 12,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 1, minWidth: 0 }}>
      <Lockup glyphSize={36} wordmarkSize={26}/>
    </div>
    <nav style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
      {isOwner ? (
        <>
          {onSetBackground && (
            <BackgroundSwatches value={background} onChange={onSetBackground}/>
          )}
          <Button variant="ghost" size="sm" onClick={onLogout}>sign out</Button>
          <Button variant="primary" size="sm" icon={<Icon name="plus" size={14}/>} onClick={onAdd}>keep one</Button>
        </>
      ) : (
        <>
          <a href="https://www.instagram.com/w.iniii03/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--wc-ink-soft)', textDecoration: 'none', font: '500 13px var(--wc-font-body)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <Icon name="instagram" size={15}/> <span>w.iniii03</span>
          </a>
          <Button variant="ghost" size="sm" icon={<Icon name="lock" size={14}/>} onClick={onLogin}>owner</Button>
        </>
      )}
    </nav>
  </header>
);

// Owner-only background swatches. Saves to Supabase via onChange.
const BackgroundSwatches = ({ value = 'sand', onChange }) => {
  const opts = [
    { key: 'sand', color: '#FAF3E7', label: 'Sand' },
    { key: 'foam', color: '#EAF3EE', label: 'Foam' },
  ];
  return (
    <div title="page background (saves for everyone)" style={{
      display: 'inline-flex', gap: 4, padding: 3,
      border: '1px solid var(--wc-edge)', borderRadius: 999,
      background: 'var(--wc-shell)',
    }}>
      {opts.map(o => (
        <button key={o.key} onClick={() => onChange(o.key)} aria-label={o.label} title={o.label}
          style={{
            width: 22, height: 22, borderRadius: 999, padding: 0, cursor: 'pointer',
            background: o.color,
            border: value === o.key ? '2px solid var(--wc-ink)' : '1px solid var(--wc-edge)',
            transition: 'transform 120ms',
          }}/>
      ))}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────
// Panda sticker (decorative)
// ──────────────────────────────────────────────────────────────────────

const PandaSticker = ({ name = 'hi', size = 80, style }) => (
  <img src={(window.PANDA_URLS || {})[name]} alt="" width={size} height={size}
    style={{ display: 'block', ...style }}/>
);

// ──────────────────────────────────────────────────────────────────────
// Modal (lightbox base)
// ──────────────────────────────────────────────────────────────────────

const Modal = ({ open, onClose, children, maxWidth = 720 }) => {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(46,61,68,0.78)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, animation: 'fadeIn 220ms var(--wc-ease-standard)',
      }}>
      <div onClick={e => e.stopPropagation()} style={{ maxWidth, width: '100%', position: 'relative' }}>
        {children}
        <IconButton icon={<Icon name="x" size={18}/>} onClick={onClose} label="close"
          style={{ position: 'absolute', top: -52, right: 0, background: 'transparent', border: '1px solid rgba(254,251,245,0.3)', color: 'var(--wc-shell)' }}/>
      </div>
    </div>
  );
};

// expose
Object.assign(window, {
  Icon, CloudGlyph, Wordmark, Lockup, Button, IconButton, Polaroid, Pill, Header, PandaSticker, Modal
});
