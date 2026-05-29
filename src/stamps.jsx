/* w.inii's cloud — Stamps collection
   Postage-stamp shaped photos, "cut" from any uploaded picture.

   Exports (via window):
     Stamp            — render one stamp with serrated edges
     StampsCard       — inline card under the daily note (preview + open all)
     StampsModal      — full collection (grid, add, delete)
     AddStampModal    — upload + drag/zoom to position + cut
*/

// ─────────────────────────────────────────────────────────────────
// Postage-stamp SVG path generator
// Rectangle (w × h) with semicircular bites along all 4 edges.
// ─────────────────────────────────────────────────────────────────
const stampPath = (w, h, tx = 9, ty = 7, r = null) => {
  if (r == null) r = Math.min(w / tx, h / ty) * 0.42;
  const sx = w / tx;
  const sy = h / ty;
  let d = 'M 0 0';
  // top (left → right)
  for (let i = 0; i < tx; i++) {
    const mid = sx * (i + 0.5);
    d += ` L ${mid - r} 0 A ${r} ${r} 0 0 0 ${mid + r} 0`;
  }
  d += ` L ${w} 0`;
  // right (top → bottom)
  for (let i = 0; i < ty; i++) {
    const mid = sy * (i + 0.5);
    d += ` L ${w} ${mid - r} A ${r} ${r} 0 0 0 ${w} ${mid + r}`;
  }
  d += ` L ${w} ${h}`;
  // bottom (right → left)
  for (let i = 0; i < tx; i++) {
    const mid = w - sx * (i + 0.5);
    d += ` L ${mid + r} ${h} A ${r} ${r} 0 0 0 ${mid - r} ${h}`;
  }
  d += ` L 0 ${h}`;
  // left (bottom → top)
  for (let i = 0; i < ty; i++) {
    const mid = h - sy * (i + 0.5);
    d += ` L 0 ${mid + r} A ${r} ${r} 0 0 0 0 ${mid - r}`;
  }
  return d + ' Z';
};

// ─────────────────────────────────────────────────────────────────
// One stamp
// ─────────────────────────────────────────────────────────────────
const Stamp = ({ src, w = 80, h = 106, rotation = 0, onClick, style }) => {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, '');
  const path = React.useMemo(() => stampPath(w, h), [w, h]);
  const pad = Math.min(w, h) * 0.06;
  return (
    <svg width={w} height={h} viewBox={`-2 -2 ${w + 4} ${h + 4}`}
      onClick={onClick}
      style={{
        display: 'inline-block', flexShrink: 0,
        cursor: onClick ? 'pointer' : 'default',
        transform: `rotate(${rotation}deg)`,
        filter: 'drop-shadow(0 1px 2px rgba(46,61,68,0.18))',
        ...style,
      }}>
      <defs>
        <clipPath id={`stamp-${uid}`}>
          <path d={path}/>
        </clipPath>
      </defs>
      <g clipPath={`url(#stamp-${uid})`}>
        <rect x="0" y="0" width={w} height={h} fill="#FEFBF5"/>
        <image href={src} x={pad} y={pad} width={w - 2 * pad} height={h - 2 * pad}
          preserveAspectRatio="xMidYMid slice"/>
      </g>
      <path d={path} fill="none" stroke="rgba(46,61,68,0.18)" strokeWidth="0.6"/>
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────
// Inline card (left column, under the daily note)
// ─────────────────────────────────────────────────────────────────
const StampsCard = ({ stamps = [], isOwner, owner = 'w.inii', onAdd, onOpenAll }) => {
  const preview = stamps.slice(0, 4);
  return (
    <div className="wc-stamps-card" style={{
      maxWidth: 480, margin: '0 auto 8px', padding: '16px 18px 18px',
      background: 'var(--wc-shell)',
      border: '1px solid var(--wc-edge)',
      borderRadius: 16,
      boxShadow: 'var(--wc-shadow-sm)',
      position: 'relative',
    }}>
      <div aria-hidden="true" style={{
        position: 'absolute', top: -10, left: 28, width: 70, height: 20,
        background: 'rgba(228,124,161,0.55)',
        transform: 'rotate(-2deg)',
        boxShadow: '0 1px 3px rgba(46,61,68,0.08)',
      }}/>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
        <div style={{
          font: '400 11px/1 var(--wc-font-stamp)', color: 'var(--wc-ink-mute)',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          stamps collection{stamps.length > 0 ? ` · ${stamps.length}` : ''}
        </div>
        {isOwner && (
          <IconButton icon={<Icon name="plus" size={14}/>} label="add stamp" onClick={onAdd}/>
        )}
      </div>

      {stamps.length === 0 ? (
        <div style={{
          padding: '18px 8px', textAlign: 'center',
          font: '500 13px/1.4 var(--wc-font-body)', color: 'var(--wc-ink-mute)',
          border: '1px dashed var(--wc-edge)', borderRadius: 12,
        }}>
          {isOwner ? 'add your first stamp ✦' : `no stamps from ${owner} yet`}
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {preview.map((s, i) => (
              <Stamp key={s.id} src={s.src} w={62} h={82}
                rotation={(i % 2 === 0 ? -3 : 4) + (i - 1.5) * 1.2}
                onClick={onOpenAll}/>
            ))}
            {stamps.length > 4 && (
              <button onClick={onOpenAll}
                style={{
                  width: 62, height: 82, borderRadius: 10,
                  background: 'var(--wc-sand)', border: '1px dashed var(--wc-edge)',
                  cursor: 'pointer',
                  font: '600 16px var(--wc-font-hand)', color: 'var(--wc-ink-soft)',
                  display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  lineHeight: 1.1,
                }}>
                <span>+{stamps.length - 4}</span>
                <span style={{ font: '500 10px var(--wc-font-stamp)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--wc-ink-mute)' }}>more</span>
              </button>
            )}
          </div>
          <button onClick={onOpenAll}
            style={{
              marginTop: 12, width: '100%',
              background: 'transparent', border: '1px dashed var(--wc-edge)',
              borderRadius: 999, padding: '8px 12px', cursor: 'pointer',
              font: '500 12px var(--wc-font-body)', color: 'var(--wc-ink-soft)',
              letterSpacing: '0.04em',
            }}>
            view all stamps →
          </button>
        </>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// Full collection modal — scrollable grid with optional delete
// ─────────────────────────────────────────────────────────────────
const StampsModal = ({ open, stamps, isOwner, onClose, onAdd, onDelete }) => {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(46,61,68,0.78)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      animation: 'fadeIn 220ms var(--wc-ease-standard)',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--wc-shell)', borderRadius: 20, maxWidth: 880, width: '100%',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: 'var(--wc-shadow-xl)', position: 'relative',
      }}>
        <IconButton icon={<Icon name="x" size={18}/>} onClick={onClose} label="close"
          style={{ position: 'absolute', top: 16, right: 16 }}/>
        <div style={{ padding: '28px 28px 16px' }}>
          <h2 style={{ font: '600 36px/1 var(--wc-font-hand)', margin: '0 0 6px', color: 'var(--wc-ink)' }}>
            stamps collection
          </h2>
          <div style={{
            font: '500 13px/1.4 var(--wc-font-body)', color: 'var(--wc-ink-mute)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
          }}>
            <span>{stamps.length} {stamps.length === 1 ? 'stamp' : 'stamps'} · cut from photos</span>
            {isOwner && (
              <Button variant="primary" size="sm" icon={<Icon name="plus" size={14}/>} onClick={onAdd}>
                add stamp
              </Button>
            )}
          </div>
        </div>
        <div style={{ padding: '0 28px 28px', overflowY: 'auto' }}>
          {stamps.length === 0 ? (
            <div style={{
              padding: '60px 20px', textAlign: 'center',
              font: '500 16px/1.4 var(--wc-font-body)', color: 'var(--wc-ink-mute)',
              border: '1px dashed var(--wc-edge)', borderRadius: 12,
            }}>
              no stamps yet ✦
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
              gap: 18,
            }}>
              {stamps.map((s, i) => (
                <div key={s.id} style={{
                  position: 'relative',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: 4,
                }}>
                  <Stamp src={s.src} w={104} h={138}
                    rotation={(((i * 37) % 7) - 3) * 1.4}/>
                  {isOwner && (
                    <button onClick={() => onDelete(s)}
                      aria-label="delete stamp"
                      style={{
                        position: 'absolute', top: 0, right: 0,
                        width: 24, height: 24, borderRadius: '50%',
                        background: 'var(--wc-shell)', border: '1px solid var(--wc-edge)',
                        cursor: 'pointer', padding: 0,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: 'var(--wc-shadow-sm)',
                        color: 'var(--wc-danger, #C75550)',
                      }}>
                      <Icon name="x" size={12}/>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// Add stamp modal — upload, then drag a stamp-shaped frame anywhere
// on the photo to choose what to cut.
// ─────────────────────────────────────────────────────────────────
const STAMP_ASPECT = 280 / 360; // w/h

const AddStampModal = ({ open, onClose, onSave }) => {
  const [imgUrl, setImgUrl]       = React.useState(null);
  const [imgEl, setImgEl]         = React.useState(null);
  const [disp, setDisp]           = React.useState({ w: 0, h: 0 }); // displayed image px
  const [frame, setFrame]         = React.useState({ x: 0, y: 0, w: 100, h: 100 / STAMP_ASPECT });
  const [drag, setDrag]           = React.useState(null);
  const [saving, setSaving]       = React.useState(false);
  const imgRef  = React.useRef(null);
  const fileRef = React.useRef(null);

  // Reset state when the modal closes
  React.useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        if (imgUrl) URL.revokeObjectURL(imgUrl);
        setImgUrl(null); setImgEl(null);
        setDisp({ w: 0, h: 0 });
        setDrag(null); setSaving(false);
      }, 220);
      return () => clearTimeout(t);
    }
  }, [open]); // eslint-disable-line

  // Keep the displayed image measurement up-to-date if the window resizes
  React.useEffect(() => {
    if (!open || !imgUrl) return;
    const measure = () => {
      if (!imgRef.current) return;
      const r = imgRef.current.getBoundingClientRect();
      setDisp(prev => {
        if (Math.abs(prev.w - r.width) < 0.5 && Math.abs(prev.h - r.height) < 0.5) return prev;
        return { w: r.width, h: r.height };
      });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [open, imgUrl, imgEl]);

  // After a new image loads, center a sensible default frame inside it
  React.useEffect(() => {
    if (!imgEl || disp.w === 0) return;
    const fw0 = Math.min(disp.w, disp.h * STAMP_ASPECT) * 0.55;
    const fh0 = fw0 / STAMP_ASPECT;
    setFrame({ x: (disp.w - fw0) / 2, y: (disp.h - fh0) / 2, w: fw0, h: fh0 });
  }, [imgEl, disp.w, disp.h]);

  if (!open) return null;

  const pickFile = () => fileRef.current?.click();

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (imgUrl) URL.revokeObjectURL(imgUrl);
    const url = URL.createObjectURL(f);
    setImgUrl(url);
    const img = new Image();
    img.onload = () => setImgEl(img);
    img.src = url;
    e.target.value = '';
  };

  // Called after the <img> renders, so we can read its laid-out size
  const onImageLoaded = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setDisp({ w: r.width, h: r.height });
  };

  const clampFrame = (f, dw = disp.w, dh = disp.h) => {
    // Don't allow the frame to be bigger than the image
    let w = Math.min(f.w, dw, dh * STAMP_ASPECT);
    let h = w / STAMP_ASPECT;
    if (h > dh) { h = dh; w = h * STAMP_ASPECT; }
    let x = Math.max(0, Math.min(dw - w, f.x));
    let y = Math.max(0, Math.min(dh - h, f.y));
    return { x, y, w, h };
  };

  // Drag the frame around
  const onFrameDown = (e) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ kind: 'move', startX: e.clientX, startY: e.clientY, ox: frame.x, oy: frame.y });
  };
  const onFrameMove = (e) => {
    if (!drag) return;
    setFrame(prev => clampFrame({
      ...prev,
      x: drag.ox + (e.clientX - drag.startX),
      y: drag.oy + (e.clientY - drag.startY),
    }));
  };
  const onFrameUp = () => setDrag(null);

  // Tap anywhere on the photo to recenter the frame at that point
  const onImageClick = (e) => {
    if (drag) return;
    const rect = imgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    setFrame(prev => clampFrame({
      ...prev,
      x: px - prev.w / 2,
      y: py - prev.h / 2,
    }));
  };

  // Resize via slider (anchored around the frame's current center)
  const onSizeChange = (newW) => {
    setFrame(prev => {
      const cx = prev.x + prev.w / 2;
      const cy = prev.y + prev.h / 2;
      const w = newW;
      const h = w / STAMP_ASPECT;
      return clampFrame({ x: cx - w / 2, y: cy - h / 2, w, h });
    });
  };

  const cut = () => {
    if (!imgEl || saving || disp.w === 0) return;
    setSaving(true);
    try {
      const ratio = imgEl.naturalWidth / disp.w;
      const sx = frame.x * ratio;
      const sy = frame.y * ratio;
      const sw = frame.w * ratio;
      const sh = frame.h * ratio;

      const OUT_W = 560;
      const OUT_H = Math.round(OUT_W / STAMP_ASPECT);
      const c = document.createElement('canvas');
      c.width = OUT_W; c.height = OUT_H;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#FEFBF5';
      ctx.fillRect(0, 0, OUT_W, OUT_H);
      ctx.drawImage(imgEl, sx, sy, sw, sh, 0, 0, OUT_W, OUT_H);

      c.toBlob(async (blob) => {
        if (!blob) { setSaving(false); return; }
        try { await onSave(blob); }
        catch (_) { /* toast upstream */ }
        finally  { setSaving(false); }
      }, 'image/png', 0.95);
    } catch (e) {
      console.error(e);
      setSaving(false);
    }
  };

  const maxFrameW = Math.min(disp.w, disp.h * STAMP_ASPECT) || 1;
  const minFrameW = maxFrameW * 0.18;

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 110,
      background: 'rgba(46,61,68,0.82)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      animation: 'fadeIn 220ms var(--wc-ease-standard)',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--wc-shell)', borderRadius: 20, maxWidth: 560, width: '100%',
        maxHeight: '94vh', overflowY: 'auto',
        padding: 28, boxShadow: 'var(--wc-shadow-xl)', position: 'relative',
      }}>
        <IconButton icon={<Icon name="x" size={18}/>} onClick={onClose} label="close"
          style={{ position: 'absolute', top: 16, right: 16 }}/>
        <h2 style={{ font: '600 36px/1 var(--wc-font-hand)', margin: '0 0 6px', color: 'var(--wc-ink)' }}>
          cut a stamp
        </h2>
        <div style={{ font: '500 13px/1.4 var(--wc-font-body)', color: 'var(--wc-ink-mute)', marginBottom: 20 }}>
          upload a photo, drag the stamp frame wherever you like, then cut.
        </div>

        <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }}/>

        {!imgUrl ? (
          <button onClick={pickFile} style={{
            display: 'block', width: '100%',
            border: '2px dashed var(--wc-edge)', borderRadius: 16,
            padding: '48px 20px', textAlign: 'center',
            background: 'var(--wc-sand)', cursor: 'pointer',
            font: 'inherit', color: 'inherit',
          }}>
            <Icon name="upload" size={24} style={{ color: 'var(--wc-ink-soft)', marginBottom: 8, display: 'inline-block' }}/>
            <div style={{ font: '600 16px var(--wc-font-body)', color: 'var(--wc-ink)' }}>
              choose a photo
            </div>
            <div style={{ font: '500 12px var(--wc-font-body)', color: 'var(--wc-ink-mute)', marginTop: 4 }}>
              jpg, png, heic
            </div>
          </button>
        ) : (
          <>
            <div style={{
              display: 'flex', justifyContent: 'center',
              padding: 8, background: 'var(--wc-sand)', borderRadius: 16,
              marginBottom: 16,
            }}>
              <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
                <img ref={imgRef} src={imgUrl}
                  onLoad={onImageLoaded}
                  onClick={onImageClick}
                  draggable={false}
                  style={{
                    display: 'block', maxWidth: '100%', maxHeight: '60vh',
                    borderRadius: 8, cursor: 'crosshair', userSelect: 'none',
                    WebkitUserDrag: 'none',
                  }}/>
                {disp.w > 0 && (
                  <>
                    {/* dim overlay with a stamp-shaped hole */}
                    <svg width={disp.w} height={disp.h}
                      style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}>
                      <defs>
                        <mask id="add-stamp-hole">
                          <rect width={disp.w} height={disp.h} fill="white"/>
                          <g transform={`translate(${frame.x},${frame.y})`}>
                            <path d={stampPath(frame.w, frame.h)} fill="black"/>
                          </g>
                        </mask>
                      </defs>
                      <rect width={disp.w} height={disp.h}
                        fill="rgba(46,61,68,0.45)"
                        mask="url(#add-stamp-hole)"/>
                      <g transform={`translate(${frame.x},${frame.y})`}>
                        <path d={stampPath(frame.w, frame.h)}
                          fill="none"
                          stroke="#FEFBF5"
                          strokeWidth="2"
                          style={{ filter: 'drop-shadow(0 0 3px rgba(46,61,68,0.6))' }}/>
                      </g>
                    </svg>
                    {/* drag handle covers the frame */}
                    <div
                      onPointerDown={onFrameDown}
                      onPointerMove={onFrameMove}
                      onPointerUp={onFrameUp}
                      onPointerCancel={onFrameUp}
                      style={{
                        position: 'absolute',
                        left: frame.x, top: frame.y,
                        width: frame.w, height: frame.h,
                        cursor: drag?.kind === 'move' ? 'grabbing' : 'grab',
                        touchAction: 'none',
                      }}
                    />
                  </>
                )}
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{
                font: '400 10px/1 var(--wc-font-stamp)', color: 'var(--wc-ink-mute)',
                letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6,
              }}>stamp size</div>
              <input type="range"
                min={minFrameW} max={maxFrameW} step={(maxFrameW - minFrameW) / 200}
                value={frame.w}
                onChange={e => onSizeChange(+e.target.value)}
                style={{ width: '100%', accentColor: 'var(--wc-sea)' }}/>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Button variant="ghost" size="md" onClick={pickFile}>different photo</Button>
              <div style={{ flex: 1 }}/>
              <Button variant="primary" size="md" onClick={cut} disabled={saving}>
                {saving ? 'cutting…' : 'cut it ✦'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

Object.assign(window, { Stamp, StampsCard, StampsModal, AddStampModal, stampPath });
