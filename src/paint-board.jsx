/* w.inii's cloud — PaintBoard + Editor + Sketchbook archive

   Components (exported on window):
     - PaintBoard         : small visible card (everyone)
     - PaintEditorModal   : fullscreen editor (owner only)
     - SketchbookModal    : browse / delete archive (everyone can browse)
     - SketchbookStrip    : compact strip under the card
*/

const PAINT_BG = '#FEFBF5';
const CANVAS_W = 1200;
const CANVAS_H = 800;

// Curated quick palette + free HSL picker
const QUICK_COLORS = [
  '#2E3D44', '#E87966', '#F08A6C', '#FCD34D',
  '#5B9AA0', '#3FA76E', '#A48BD8', '#E47CA1',
  '#FEFBF5', '#7A4A1A',
];

// ──────────────────────────────────────────────────────────────────────
// PaintBoard — small preview card
// ──────────────────────────────────────────────────────────────────────

const PaintBoard = ({ painting, isOwner, owner = 'w.inii', onSave, onOpenEditor }) => {
  // Visitor view: just see the doodle (or nothing).
  if (!isOwner) {
    if (!painting) {
      return (
        <div className="wc-paint-card" style={emptyCardStyle}>
          no doodle from {owner} yet
        </div>
      );
    }
    return (
      <div className="wc-paint-card" style={filledCardStyle}>
        <div aria-hidden="true" style={tapeStyle}/>
        <div style={cardLabelStyle}>a little doodle · by {owner}</div>
        <img src={painting} alt="today's doodle" style={previewImgStyle}/>
      </div>
    );
  }

  // Owner view: tap card to open editor.
  return (
    <div className="wc-paint-card" style={{ ...filledCardStyle, cursor: 'pointer' }}
      onClick={onOpenEditor}
      role="button" tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenEditor(); } }}>
      <div aria-hidden="true" style={tapeStyle}/>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
        <div style={cardLabelStyle}>a little doodle</div>
        <div style={editHintStyle}>tap to edit ✎</div>
      </div>
      {painting
        ? <img src={painting} alt="today's doodle" style={previewImgStyle}/>
        : (
          <div style={emptyCanvasStyle}>
            <div style={{ font: '500 14px/1.4 var(--wc-font-body)', color: 'var(--wc-ink-mute)', textAlign: 'center' }}>
              start a doodle ✨
            </div>
          </div>
        )}
    </div>
  );
};

const emptyCardStyle = {
  maxWidth: 720, margin: '0 auto 24px', padding: '14px 24px',
  background: 'transparent', border: '1px dashed var(--wc-edge)',
  borderRadius: 16, textAlign: 'center',
  font: '400 11px/1.4 var(--wc-font-stamp)', color: 'var(--wc-ink-mute)',
  letterSpacing: '0.08em', textTransform: 'uppercase',
};

const filledCardStyle = {
  maxWidth: 480, margin: '0 auto 24px', padding: '16px',
  background: 'var(--wc-shell)', border: '1px solid var(--wc-edge)',
  borderRadius: 16, boxShadow: 'var(--wc-shadow-sm)', position: 'relative',
};

const tapeStyle = {
  position: 'absolute', top: -10, left: 28, width: 70, height: 20,
  background: 'rgba(90,159,182,0.55)', transform: 'rotate(3deg)',
  boxShadow: '0 1px 3px rgba(46,61,68,0.08)',
};

const cardLabelStyle = {
  font: '400 11px/1 var(--wc-font-stamp)', color: 'var(--wc-ink-mute)',
  letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10,
};

const editHintStyle = {
  font: '500 11px/1 var(--wc-font-body)', color: 'var(--wc-sea-deep)',
  letterSpacing: '0.04em',
};

const previewImgStyle = {
  display: 'block', width: '100%', borderRadius: 12,
  border: '1px solid var(--wc-edge)', background: PAINT_BG,
};

const emptyCanvasStyle = {
  width: '100%', aspectRatio: '3 / 2', borderRadius: 12,
  border: '1.5px dashed var(--wc-edge-strong)', background: PAINT_BG,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

// ──────────────────────────────────────────────────────────────────────
// PaintEditorModal — the big creative canvas
// ──────────────────────────────────────────────────────────────────────

const PaintEditorModal = ({ open, painting, onClose, onKeep, onClear }) => {
  const canvasRef = React.useRef(null);
  const lastRef = React.useRef(null);
  const wrapRef = React.useRef(null);
  const fileInput = React.useRef(null);

  // Painting state
  const [color, setColor] = React.useState('#2E3D44');
  const [size, setSize] = React.useState(6);
  const [tool, setTool] = React.useState('brush'); // brush | eraser | move
  const [drawing, setDrawing] = React.useState(false);

  // Floating items (stickers + pasted images)
  const [items, setItems] = React.useState([]); // {id, src, x, y, w, h, rot}
  const [selectedId, setSelectedId] = React.useState(null);

  // UI
  const [tab, setTab] = React.useState('brush'); // brush | stickers
  const [stickerGroup, setStickerGroup] = React.useState('pandas');
  const [busy, setBusy] = React.useState(false);

  // Init canvas once when opened
  React.useEffect(() => {
    if (!open) return;
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    ctx.fillStyle = PAINT_BG;
    ctx.fillRect(0, 0, c.width, c.height);
    if (painting) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => ctx.drawImage(img, 0, 0, c.width, c.height);
      img.src = painting;
    }
    setItems([]);
    setSelectedId(null);
    setTool('brush');
    setTab('brush');
  }, [open, painting]);

  // Esc to close, Del/Backspace to delete selected item
  React.useEffect(() => {
    if (!open) return;
    const onKey = e => {
      if (e.key === 'Escape') { onClose(); }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId
          && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        setItems(items => items.filter(it => it.id !== selectedId));
        setSelectedId(null);
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, selectedId, onClose]);

  // Paste images from clipboard
  React.useEffect(() => {
    if (!open) return;
    const onPaste = e => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const it of items) {
        if (it.type && it.type.startsWith('image/')) {
          const file = it.getAsFile();
          if (file) { addImageFromFile(file); e.preventDefault(); return; }
        }
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // canvas → CSS coords mapping
  const canvasPos = (e) => {
    const c = canvasRef.current;
    const r = c.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (c.width / r.width),
      y: (e.clientY - r.top)  * (c.height / r.height),
    };
  };

  // ─── Brush / eraser ─────────────────────────────────────────────────
  const startDraw = (e) => {
    if (tool !== 'brush' && tool !== 'eraser') return;
    if (e.target !== canvasRef.current) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrawing(true);
    setSelectedId(null);
    const p = canvasPos(e);
    lastRef.current = p;
    const ctx = canvasRef.current.getContext('2d');
    ctx.fillStyle = tool === 'eraser' ? PAINT_BG : color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, size / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const moveDraw = (e) => {
    if (!drawing) return;
    const c = canvasRef.current;
    const ctx = c.getContext('2d');
    const p = canvasPos(e);
    const last = lastRef.current || p;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = size;
    ctx.strokeStyle = tool === 'eraser' ? PAINT_BG : color;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastRef.current = p;
  };

  const endDraw = () => { setDrawing(false); lastRef.current = null; };

  // ─── Items (stickers + paste) ───────────────────────────────────────
  const addItem = (src, opts = {}) => {
    const id = Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    const w = opts.w || 220;
    const h = opts.h || 220;
    const x = (CANVAS_W - w) / 2 + (Math.random() * 200 - 100);
    const y = (CANVAS_H - h) / 2 + (Math.random() * 200 - 100);
    setItems(prev => [...prev, { id, src, x, y, w, h, rot: 0 }]);
    setSelectedId(id);
    setTool('move');
  };

  const addStickerByKey = async (key) => {
    try {
      const src = await stickerToDataURL(key, 240);
      addItem(src, { w: 220, h: 220 });
    } catch (e) {
      console.error(e);
    }
  };

  const addImageFromFile = (file) => {
    const reader = new FileReader();
    reader.onload = e => {
      // Get natural size so wide pastes don't all become squares
      const img = new Image();
      img.onload = () => {
        const max = 420;
        let w = img.naturalWidth, h = img.naturalHeight;
        if (w > max || h > max) {
          const s = max / Math.max(w, h);
          w *= s; h *= s;
        }
        addItem(e.target.result, { w, h });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // ─── Item interaction (drag / resize / rotate) ──────────────────────
  // We use pointer events on the items layer. The interaction is driven by
  // "handle" elements inside the selected item.
  const startItemDrag = (e, item, mode) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedId(item.id);
    setTool('move');
    const wrap = wrapRef.current;
    if (!wrap) return;
    const r = wrap.getBoundingClientRect();
    const scale = r.width / CANVAS_W;
    const startX = e.clientX, startY = e.clientY;
    const origin = { ...item };
    const itemCenterX = origin.x + origin.w / 2;
    const itemCenterY = origin.y + origin.h / 2;

    const onMove = (ev) => {
      const dx = (ev.clientX - startX) / scale;
      const dy = (ev.clientY - startY) / scale;
      setItems(prev => prev.map(it => {
        if (it.id !== item.id) return it;
        if (mode === 'move') {
          return { ...it, x: origin.x + dx, y: origin.y + dy };
        }
        if (mode === 'resize') {
          // Corner-handle resize: scale proportionally based on distance from center
          const startDist = Math.hypot(origin.w / 2, origin.h / 2);
          const endDist = Math.hypot((origin.x + origin.w) + dx - itemCenterX, (origin.y + origin.h) + dy - itemCenterY);
          const s = Math.max(0.15, endDist / startDist);
          const nw = origin.w * s;
          const nh = origin.h * s;
          return {
            ...it,
            w: nw, h: nh,
            x: itemCenterX - nw / 2,
            y: itemCenterY - nh / 2,
          };
        }
        if (mode === 'rotate') {
          const a = Math.atan2(ev.clientY - (r.top + (itemCenterY * scale)),
                               ev.clientX - (r.left + (itemCenterX * scale)));
          return { ...it, rot: (a * 180 / Math.PI) + 90 };
        }
        return it;
      }));
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const deleteItem = (id) => setItems(prev => prev.filter(x => x.id !== id));

  // ─── Save / clear ───────────────────────────────────────────────────
  const flatten = async () => {
    // Composite canvas + items into a new canvas at full res
    const out = document.createElement('canvas');
    out.width = CANVAS_W; out.height = CANVAS_H;
    const ctx = out.getContext('2d');
    ctx.drawImage(canvasRef.current, 0, 0);
    for (const it of items) {
      try {
        const img = await loadImage(it.src);
        ctx.save();
        ctx.translate(it.x + it.w / 2, it.y + it.h / 2);
        ctx.rotate((it.rot * Math.PI) / 180);
        ctx.drawImage(img, -it.w / 2, -it.h / 2, it.w, it.h);
        ctx.restore();
      } catch (e) {
        console.warn('skipped one sticker while flattening', e);
      }
    }
    try {
      return out.toDataURL('image/png');
    } catch (e) {
      // Canvas tainted (rare, some mobile browsers) — fall back to just the
      // brush layer so the save still works instead of crashing.
      console.warn('flatten toDataURL failed, saving brush layer only', e);
      return canvasRef.current.toDataURL('image/png');
    }
  };

  const onKeepClick = async () => {
    setBusy(true);
    try {
      const dataUrl = await flatten();
      await onKeep(dataUrl);
      // After successful save, reset to a clean canvas
      const ctx = canvasRef.current.getContext('2d');
      ctx.fillStyle = PAINT_BG;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      setItems([]);
      setSelectedId(null);
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  const onClearClick = async () => {
    if (!confirm('clear the canvas? this won\'t save anything.')) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.fillStyle = PAINT_BG;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    setItems([]);
    setSelectedId(null);
    // Tell parent to also clear the persisted painting (so visitors see empty too)
    if (onClear) {
      try { await onClear(); } catch (e) { console.error(e); }
    }
  };

  if (!open) return null;

  return (
    <div onClick={onClose} style={editorVeilStyle}>
      <div onClick={e => e.stopPropagation()} style={editorBoxStyle}>
        {/* HEADER */}
        <div style={editorHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <h2 style={{ margin: 0, font: '700 26px var(--wc-font-hand)' }}>doodle studio</h2>
            <span style={{ font: '500 12px var(--wc-font-stamp)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--wc-ink-mute)' }}>
              paint · sticker · paste · keep
            </span>
          </div>
          <button onClick={onClose} aria-label="close" style={iconBtn}>✕</button>
        </div>

        {/* CANVAS STAGE */}
        <div ref={wrapRef} style={stageStyle}
          onPointerDown={() => setSelectedId(null)}>
          <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H}
            onPointerDown={startDraw} onPointerMove={moveDraw}
            onPointerUp={endDraw} onPointerCancel={endDraw}
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              background: PAINT_BG, touchAction: 'none',
              cursor: tool === 'brush' ? 'crosshair' : tool === 'eraser' ? 'cell' : 'default',
            }}
          />
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {items.map(it => (
              <FloatingItem key={it.id} item={it}
                selected={selectedId === it.id}
                onSelect={() => { setSelectedId(it.id); setTool('move'); }}
                onStart={(e, mode) => startItemDrag(e, it, mode)}
                onDelete={() => deleteItem(it.id)}
                canvasW={CANVAS_W} canvasH={CANVAS_H}/>
            ))}
          </div>
        </div>

        {/* TABS */}
        <div style={tabBarStyle}>
          <button onClick={() => setTab('brush')}    style={tabBtn(tab === 'brush')}>🖌 brush</button>
          <button onClick={() => setTab('stickers')} style={tabBtn(tab === 'stickers')}>✨ stickers</button>
          <input ref={fileInput} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => { if (e.target.files[0]) addImageFromFile(e.target.files[0]); e.target.value = ''; }}/>
          <button onClick={() => fileInput.current?.click()} style={tabBtnQuiet}>📎 add image</button>
          <span style={pasteHintStyle}>or press Ctrl+V to paste</span>
          <div style={{ flex: 1 }}/>
          <button onClick={onClearClick} style={ghostBtnStyle}>🗑 clear</button>
          <button onClick={onKeepClick} disabled={busy} style={primaryBtnStyle}>
            {busy ? 'saving…' : '💾 keep this'}
          </button>
        </div>

        {/* PANEL */}
        {tab === 'brush' && (
          <div style={panelStyle}>
            <PalettePanel
              color={color} setColor={setColor}
              size={size} setSize={setSize}
              tool={tool} setTool={setTool}/>
          </div>
        )}
        {tab === 'stickers' && (
          <div style={panelStyle}>
            <StickerPanel
              group={stickerGroup} setGroup={setStickerGroup}
              onPick={addStickerByKey}/>
          </div>
        )}
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────
// Floating item — draggable / resizable / rotatable sticker
// ──────────────────────────────────────────────────────────────────────

const FloatingItem = ({ item, selected, onSelect, onStart, onDelete, canvasW, canvasH }) => {
  // Position as % of canvas so it scales with the stage
  const style = {
    position: 'absolute',
    left: `${(item.x / canvasW) * 100}%`,
    top: `${(item.y / canvasH) * 100}%`,
    width: `${(item.w / canvasW) * 100}%`,
    height: `${(item.h / canvasH) * 100}%`,
    transform: `rotate(${item.rot}deg)`,
    transformOrigin: 'center center',
    pointerEvents: 'auto',
    cursor: 'move',
    userSelect: 'none',
    touchAction: 'none',
  };
  return (
    <div style={style}
      onPointerDown={(e) => { e.stopPropagation(); onSelect(); onStart(e, 'move'); }}>
      <img src={item.src} alt="" draggable={false}
        style={{ width: '100%', height: '100%', pointerEvents: 'none',
          outline: selected ? '2px dashed var(--wc-sea-deep)' : 'none',
          outlineOffset: 4 }}/>
      {selected && (
        <>
          {/* delete */}
          <button onPointerDown={(e) => { e.stopPropagation(); onDelete(); }}
            style={handleDel} aria-label="delete sticker">✕</button>
          {/* rotate */}
          <button onPointerDown={(e) => onStart(e, 'rotate')} style={handleRot} aria-label="rotate sticker">⟳</button>
          {/* resize */}
          <button onPointerDown={(e) => onStart(e, 'resize')} style={handleResize} aria-label="resize sticker">⤡</button>
        </>
      )}
    </div>
  );
};

const handleBase = {
  position: 'absolute', width: 28, height: 28, borderRadius: 999,
  background: 'var(--wc-shell)', border: '1.5px solid var(--wc-sea-deep)',
  color: 'var(--wc-sea-deep)', cursor: 'pointer', padding: 0,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  font: '600 14px/1 var(--wc-font-body)', boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
  touchAction: 'none',
};
const handleDel    = { ...handleBase, top: -14, right: -14, color: 'var(--wc-danger)', borderColor: 'var(--wc-danger)' };
const handleRot    = { ...handleBase, top: -14, left: '50%', transform: 'translateX(-50%)', cursor: 'grab' };
const handleResize = { ...handleBase, bottom: -14, right: -14, cursor: 'nwse-resize' };

// ──────────────────────────────────────────────────────────────────────
// Palette panel
// ──────────────────────────────────────────────────────────────────────

const PalettePanel = ({ color, setColor, size, setSize, tool, setTool }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
    <div style={subLabel}>color</div>
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {QUICK_COLORS.map(c => (
        <button key={c} onClick={() => { setColor(c); setTool('brush'); }}
          aria-label={`color ${c}`}
          style={{
            width: 28, height: 28, borderRadius: '50%', padding: 0,
            background: c, cursor: 'pointer',
            border: color === c ? '2px solid var(--wc-ink)' : '1px solid var(--wc-edge-strong)',
            boxShadow: color === c ? '0 0 0 2px var(--wc-shell), 0 0 0 3px var(--wc-ink)' : 'none',
          }}/>
      ))}
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <input type="color" value={color} onChange={e => { setColor(e.target.value); setTool('brush'); }}
          style={{
            width: 32, height: 32, padding: 0, border: '1px solid var(--wc-edge-strong)',
            borderRadius: 999, cursor: 'pointer', background: color,
          }} aria-label="custom color"/>
        <span style={{ font: '500 12px var(--wc-font-body)', color: 'var(--wc-ink-mute)' }}>any</span>
      </label>
    </div>
    <div style={vDivider}/>
    <div style={subLabel}>size</div>
    <input type="range" min={2} max={40} value={size} onChange={e => setSize(parseInt(e.target.value, 10))}
      style={{ width: 120 }}/>
    <span style={{ font: '500 13px var(--wc-font-body)', color: 'var(--wc-ink-soft)', width: 28 }}>{size}</span>
    <div style={vDivider}/>
    <button onClick={() => setTool('brush')}  style={toolBtn(tool === 'brush')}>🖌 brush</button>
    <button onClick={() => setTool('eraser')} style={toolBtn(tool === 'eraser')}>🧽 eraser</button>
    <button onClick={() => setTool('move')}   style={toolBtn(tool === 'move')}>✋ select</button>
  </div>
);

// ──────────────────────────────────────────────────────────────────────
// Sticker panel
// ──────────────────────────────────────────────────────────────────────

const StickerPanel = ({ group, setGroup, onPick }) => (
  <div>
    <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
      {[
        { key: 'pandas', label: '🐼 pandas' },
        { key: 'beach',  label: '🌊 beach' },
        { key: 'sweets', label: '🍓 sweets' },
      ].map(t => (
        <button key={t.key} onClick={() => setGroup(t.key)} style={tagBtn(group === t.key)}>
          {t.label}
        </button>
      ))}
      <span style={{ flex: 1 }}/>
      <span style={{ font: '500 12px var(--wc-font-body)', color: 'var(--wc-ink-mute)' }}>
        tap to place →
      </span>
    </div>
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      {STICKERS[group].map(s => (
        <button key={s.key} onClick={() => onPick(s.key)} title={s.label}
          style={stickerBtnStyle}>
          {renderSticker(s.key, 52)}
        </button>
      ))}
    </div>
  </div>
);

// ──────────────────────────────────────────────────────────────────────
// Sketchbook archive — strip + modal
// ──────────────────────────────────────────────────────────────────────

const SketchbookStrip = ({ doodles, onOpenAll, onOpenOne }) => {
  if (!doodles || doodles.length === 0) return null;
  const preview = doodles.slice(0, 4);
  const more = doodles.length - preview.length;
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ font: '500 13px var(--wc-font-body)', color: 'var(--wc-ink-mute)' }}>
          my sketchbook · {doodles.length} doodle{doodles.length === 1 ? '' : 's'}
        </div>
        {doodles.length > preview.length && (
          <button onClick={onOpenAll}
            style={{ background: 'transparent', border: 0, color: 'var(--wc-sea-deep)',
              font: '600 13px var(--wc-font-body)', cursor: 'pointer', textDecoration: 'underline' }}>
            see all →
          </button>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '2px 2px 6px' }}>
        {preview.map(d => (
          <button key={d.id} onClick={() => onOpenOne(d)} style={stripThumbStyle} title="open">
            <img src={d.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 9, display: 'block' }}/>
          </button>
        ))}
        {more > 0 && (
          <button onClick={onOpenAll} style={{ ...stripThumbStyle, background: 'var(--wc-foam)', color: 'var(--wc-sea-deep)',
            font: '600 11px/1.2 var(--wc-font-stamp)', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            +{more} more
          </button>
        )}
      </div>
    </div>
  );
};

const SketchbookModal = ({ open, doodles, isOwner, onClose, onDelete }) => {
  const [active, setActive] = React.useState(null);
  React.useEffect(() => { if (!open) setActive(null); }, [open]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={editorVeilStyle}>
      <div onClick={e => e.stopPropagation()} style={{ ...editorBoxStyle, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
          <h2 style={{ margin: 0, font: '700 28px var(--wc-font-hand)' }}>
            my sketchbook · {doodles.length} doodle{doodles.length === 1 ? '' : 's'}
          </h2>
          <button onClick={onClose} aria-label="close" style={iconBtn}>✕</button>
        </div>
        {active ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src={active.src} alt="" style={{
              maxWidth: '100%', maxHeight: '60vh', borderRadius: 14,
              border: '1px solid var(--wc-edge)', background: PAINT_BG, boxShadow: 'var(--wc-shadow-md)',
            }}/>
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button onClick={() => setActive(null)} style={ghostBtnStyle}>← back</button>
              {isOwner && (
                <button style={dangerBtnStyle}
                  onClick={async () => {
                    if (!confirm('forget this doodle?')) return;
                    await onDelete(active);
                    setActive(null);
                  }}>🗑 delete</button>
              )}
            </div>
          </div>
        ) : doodles.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--wc-ink-mute)' }}>
            no doodles kept yet.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, maxHeight: '70vh', overflowY: 'auto', padding: 4 }}>
            {doodles.map(d => (
              <button key={d.id} onClick={() => setActive(d)} style={archiveThumbStyle}>
                <img src={d.src} alt="" style={{ width: '100%', aspectRatio: '3 / 2', objectFit: 'cover', borderRadius: 10, display: 'block', background: PAINT_BG }}/>
                <span style={{ display: 'block', font: '500 11px var(--wc-font-stamp)', letterSpacing: '0.05em', color: 'var(--wc-ink-mute)', textTransform: 'uppercase', marginTop: 6 }}>
                  {fmtDate(d.createdAt)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────
// Style + util
// ──────────────────────────────────────────────────────────────────────

const editorVeilStyle = {
  position: 'fixed', inset: 0, zIndex: 200,
  background: 'rgba(46,61,68,0.78)', backdropFilter: 'blur(12px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 16,
};
const editorBoxStyle = {
  background: 'var(--wc-shell)', borderRadius: 18,
  width: '100%', maxWidth: 1100, maxHeight: '95vh',
  display: 'flex', flexDirection: 'column',
  boxShadow: 'var(--wc-shadow-xl, 0 28px 80px rgba(0,0,0,0.35))',
  overflow: 'hidden',
};
const editorHeaderStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '14px 18px', borderBottom: '1px solid var(--wc-edge)',
  flexWrap: 'wrap', gap: 8,
};
const stageStyle = {
  position: 'relative', width: '100%', aspectRatio: `${CANVAS_W} / ${CANVAS_H}`,
  background: PAINT_BG,
  borderBottom: '1px solid var(--wc-edge)',
  overflow: 'hidden',
};
const tabBarStyle = {
  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
  borderBottom: '1px solid var(--wc-edge)', flexWrap: 'wrap',
};
const panelStyle = { padding: '12px 16px 18px' };

const iconBtn = {
  width: 36, height: 36, borderRadius: 999, border: '1px solid var(--wc-edge-strong)',
  background: 'var(--wc-shell)', color: 'var(--wc-ink)', cursor: 'pointer',
  font: '600 14px/1 var(--wc-font-body)',
};
const ghostBtnStyle = {
  background: 'var(--wc-shell)', border: '1px solid var(--wc-edge-strong)',
  color: 'var(--wc-ink)', padding: '7px 14px', borderRadius: 999,
  font: '600 13px var(--wc-font-body)', cursor: 'pointer',
};
const primaryBtnStyle = {
  background: 'var(--wc-coral)', border: '1px solid transparent',
  color: 'var(--wc-shell)', padding: '7px 16px', borderRadius: 999,
  font: '600 13px var(--wc-font-body)', cursor: 'pointer',
};
const dangerBtnStyle = {
  background: 'var(--wc-shell)', border: '1px solid var(--wc-danger)',
  color: 'var(--wc-danger)', padding: '7px 14px', borderRadius: 999,
  font: '600 13px var(--wc-font-body)', cursor: 'pointer',
};
const tabBtn = (active) => ({
  padding: '7px 14px', borderRadius: 999,
  border: '1px solid var(--wc-edge-strong)',
  background: active ? 'var(--wc-ink)' : 'var(--wc-shell)',
  color: active ? 'var(--wc-shell)' : 'var(--wc-ink)',
  font: '600 13px var(--wc-font-body)', cursor: 'pointer',
});
const tabBtnQuiet = {
  padding: '7px 12px', borderRadius: 999,
  border: '1px dashed var(--wc-edge-strong)',
  background: 'var(--wc-shell)', color: 'var(--wc-ink-soft)',
  font: '500 12px var(--wc-font-body)', cursor: 'pointer',
};
const pasteHintStyle = {
  font: '500 11px var(--wc-font-body)', color: 'var(--wc-ink-mute)',
};
const subLabel = {
  font: '500 12px var(--wc-font-stamp)', letterSpacing: '0.06em',
  textTransform: 'uppercase', color: 'var(--wc-ink-mute)',
};
const vDivider = { width: 1, height: 24, background: 'var(--wc-edge)' };
const toolBtn = (active) => ({
  padding: '6px 12px', borderRadius: 999,
  border: `1px solid ${active ? 'var(--wc-ink)' : 'var(--wc-edge-strong)'}`,
  background: active ? 'var(--wc-sand-2)' : 'var(--wc-shell)',
  color: 'var(--wc-ink)', font: '500 12px var(--wc-font-body)', cursor: 'pointer',
});
const tagBtn = (active) => ({
  padding: '6px 12px', borderRadius: 999,
  border: `1px solid ${active ? 'var(--wc-ink)' : 'var(--wc-edge-strong)'}`,
  background: active ? 'var(--wc-sand-2)' : 'var(--wc-shell)',
  color: 'var(--wc-ink)', font: '500 12px var(--wc-font-body)', cursor: 'pointer',
});
const stickerBtnStyle = {
  width: 64, height: 64, padding: 0, border: '1px solid var(--wc-edge)',
  background: 'var(--wc-shell)', borderRadius: 12, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
};
const stripThumbStyle = {
  flex: '0 0 84px', width: 84, height: 84, padding: 0,
  border: '1px solid var(--wc-edge)', borderRadius: 10,
  background: 'var(--wc-shell)', cursor: 'pointer', overflow: 'hidden',
};
const archiveThumbStyle = {
  border: '1px solid var(--wc-edge)', borderRadius: 12, padding: 6,
  background: 'var(--wc-shell)', cursor: 'pointer', textAlign: 'left',
};

const loadImage = (src) => new Promise((res, rej) => {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => res(img);
  img.onerror = rej;
  img.src = src;
});

const fmtDate = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toLowerCase();
  } catch { return ''; }
};

Object.assign(window, { PaintBoard, PaintEditorModal, SketchbookModal, SketchbookStrip });
