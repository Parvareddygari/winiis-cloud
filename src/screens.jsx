/* w.inii's cloud — screens (Feed, Hero, Lightbox, Upload, Login) */

// Relative "x ago" helper for last-updated timestamps.
const timeAgo = (iso) => {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (isNaN(then)) return '';
  const secs = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (secs < 45) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  try {
    return 'on ' + new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toLowerCase();
  } catch { return ''; }
};
window.timeAgo = timeAgo;

// ──────────────────────────────────────────────────────────────────────
// MEMORY data (placeholder photos via gradients + optional overlay shapes)
// ──────────────────────────────────────────────────────────────────────

const PhotoOverlay = ({ kind }) => {
  // little SVG bits to make placeholder photos feel like real scenes
  if (kind === 'sun') return (
    <svg style={{ position:'absolute', inset:0 }} viewBox="0 0 100 100" preserveAspectRatio="none">
      <circle cx="72" cy="28" r="14" fill="#FCE6B6" opacity="0.85"/>
    </svg>
  );
  if (kind === 'waves') return (
    <svg style={{ position:'absolute', left:0, right:0, bottom:'30%', width:'100%', height:30 }} viewBox="0 0 200 30" preserveAspectRatio="none">
      <path d="M 0 15 Q 25 5, 50 15 T 100 15 T 150 15 T 200 15" stroke="#FEFBF5" strokeWidth="1.5" fill="none" opacity="0.6"/>
      <path d="M 0 22 Q 25 12, 50 22 T 100 22 T 150 22 T 200 22" stroke="#FEFBF5" strokeWidth="1.5" fill="none" opacity="0.4"/>
    </svg>
  );
  if (kind === 'palm') return (
    <svg style={{ position:'absolute', left:'8%', bottom:0, height:'70%' }} viewBox="0 0 60 100">
      <path d="M 30 100 L 30 30" stroke="#2E3D44" strokeWidth="2.5" opacity="0.7"/>
      <path d="M 30 30 Q 10 20, 0 28 M 30 30 Q 50 20, 60 28 M 30 30 Q 10 8, 5 14 M 30 30 Q 50 8, 55 14" stroke="#2E3D44" strokeWidth="2" opacity="0.7" fill="none"/>
    </svg>
  );
  if (kind === 'leaf') return (
    <svg style={{ position:'absolute', inset:0 }} viewBox="0 0 100 100" preserveAspectRatio="none">
      <ellipse cx="30" cy="60" rx="20" ry="35" fill="#2E3D44" opacity="0.25" transform="rotate(-25 30 60)"/>
      <ellipse cx="70" cy="50" rx="18" ry="32" fill="#2E3D44" opacity="0.2" transform="rotate(20 70 50)"/>
    </svg>
  );
  if (kind === 'horizon') return (
    <div style={{ position:'absolute', left:0, right:0, top:'52%', height:1, background:'rgba(46,61,68,0.3)' }}/>
  );
  if (kind === 'cake') return (
    <svg style={{ position:'absolute', left:'30%', bottom:'15%', width:'40%' }} viewBox="0 0 100 80">
      <rect x="20" y="40" width="60" height="30" fill="#FEFBF5" rx="3"/>
      <rect x="20" y="40" width="60" height="6" fill="#F08A6C"/>
      <line x1="50" y1="20" x2="50" y2="40" stroke="#F5C76E" strokeWidth="2"/>
      <path d="M 47 14 Q 50 8, 53 14 Q 51 20, 50 20 Q 49 20, 47 14 Z" fill="#F08A6C"/>
    </svg>
  );
  return null;
};

// ──────────────────────────────────────────────────────────────────────
// MEMORY data — starts empty; owner adds via UploadModal
// ──────────────────────────────────────────────────────────────────────

const MEMORIES = [];

// MEMORIES is empty now — no .forEach needed

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

// ──────────────────────────────────────────────────────────────────────
// MOOD presets + Mood card + Mood picker
// ──────────────────────────────────────────────────────────────────────

const MOODS = [
  { id: 'happy',    label: 'happy',          panda: 'hi',       phrase: 'feeling happy today' },
  { id: 'love',     label: 'in love',        panda: 'love',     phrase: 'in love with the world today' },
  { id: 'sad',      label: 'a little sad',   panda: 'sad',      phrase: 'a little sad today' },
  { id: 'thinking', label: 'thinking',       panda: 'thinking', phrase: 'somewhere in her head today' },
  { id: 'calm',     label: 'calm',           panda: 'float',    phrase: 'floating gently today' },
  { id: 'tired',    label: 'tired',          panda: 'sleepy',   phrase: 'sleepy today' },
  { id: 'chill',    label: 'chill',          panda: 'beach',    phrase: 'feeling chill today' },
];
const findMood = id => MOODS.find(m => m.id === id) || MOODS[0];

const MoodCard = ({ mood, isOwner, onEdit, owner = 'w.inii', updatedAt }) => {
  const m = findMood(mood);
  const [hover, setHover] = React.useState(false);
  const ago = timeAgo(updatedAt);
  return (
    <div
      className="wc-mood-card"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        maxWidth: 480, margin: '0 auto 8px', padding: '14px 18px',
        background: 'var(--wc-shell)',
        border: '1px solid var(--wc-edge)',
        borderRadius: 16,
        boxShadow: 'var(--wc-shadow-sm)',
        display: 'flex', alignItems: 'center', gap: 14,
        position: 'relative',
        transition: 'all 220ms var(--wc-ease-standard)',
        ...(isOwner && hover ? { borderColor: 'var(--wc-sea)', boxShadow: 'var(--wc-shadow-md)' } : {}),
      }}>
      <img key={m.panda} src={window.PANDA_URLS[m.panda]} alt={m.label}
        width={64} height={64}
        className="panda-pop wc-mood-panda"
        style={{ display: 'block', flexShrink: 0 }}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          font: '400 10px/1 var(--wc-font-stamp)', color: 'var(--wc-ink-mute)',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          {owner} · mood
        </div>
        <div className="wc-mood-phrase" style={{
          font: '600 24px/1.1 var(--wc-font-hand)', color: 'var(--wc-ink)',
          marginTop: 4,
          textWrap: 'pretty',
          overflowWrap: 'break-word',
        }}>
          {m.phrase}
        </div>
        {ago && (
          <div style={{
            font: '400 11px/1.2 var(--wc-font-body)', color: 'var(--wc-ink-mute)',
            marginTop: 4,
          }}>
            updated {ago}
          </div>
        )}
      </div>
      {isOwner ? (
        <div className="wc-mood-cta">
          <Button variant="secondary" size="sm" onClick={onEdit}
            icon={<Icon name="edit" size={14}/>}>
            change mood
          </Button>
        </div>
      ) : (
        <div className="wc-mood-cta" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
          <span style={{
            font: '400 10px/1 var(--wc-font-stamp)', color: 'var(--wc-ink-mute)',
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>kept by {owner}</span>
          <Icon name="lock" size={14} style={{ color: 'var(--wc-ink-faint)' }}/>
        </div>
      )}
    </div>
  );
};

const MoodPicker = ({ open, value, onPick, onClose }) => {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(46,61,68,0.78)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--wc-shell)', borderRadius: 20, maxWidth: 560, width: '100%',
        padding: 32, boxShadow: 'var(--wc-shadow-xl)', position: 'relative',
      }}>
        <IconButton icon={<Icon name="x" size={18}/>} onClick={onClose} label="close"
          style={{ position: 'absolute', top: 16, right: 16 }}/>
        <h2 style={{ font: '600 36px/1 var(--wc-font-hand)', margin: '0 0 6px', color: 'var(--wc-ink)' }}>
          how are you today?
        </h2>
        <div style={{ font: '500 13px/1.4 var(--wc-font-body)', color: 'var(--wc-ink-mute)', marginBottom: 20 }}>
          pick a mood — visitors will see it on your cloud.
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
        }}>
          {MOODS.map(m => {
            const active = m.id === value;
            return (
              <button key={m.id} onClick={() => onPick(m.id)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  padding: '14px 8px',
                  background: active ? 'var(--wc-coral-tint)' : 'var(--wc-sand)',
                  border: `1.5px solid ${active ? 'var(--wc-coral)' : 'var(--wc-edge)'}`,
                  borderRadius: 16, cursor: 'pointer',
                  transition: 'all 220ms var(--wc-ease-standard)',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = 'var(--wc-sea)'; e.currentTarget.style.background = 'var(--wc-foam)'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = 'var(--wc-edge)'; e.currentTarget.style.background = 'var(--wc-sand)'; } }}
              >
                <img src={window.PANDA_URLS[m.panda]} alt="" width={64} height={64}/>
                <span style={{
                  font: '600 13px/1.2 var(--wc-font-body)',
                  color: active ? 'var(--wc-coral)' : 'var(--wc-ink)',
                  textAlign: 'center',
                }}>{m.label}</span>
              </button>
            );
          })}
        </div>
        <div style={{
          marginTop: 20, padding: 14, background: 'var(--wc-foam)', borderRadius: 12,
          font: '500 13px/1.4 var(--wc-font-body)', color: 'var(--wc-sea-deep)',
          display: 'flex', gap: 8, alignItems: 'center',
        }}>
          <Icon name="lock" size={14}/>
          only you can change this · visitors see it but can't edit.
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────
// DAILY NOTE — a small handwritten note below the mood card
// Owner: click to edit inline. Visitors: read-only; card hides when empty.
// ──────────────────────────────────────────────────────────────────────

const DailyNoteCard = ({ note, isOwner, owner = 'w.inii', onSave, updatedAt }) => {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(note || '');
  const taRef = React.useRef(null);

  React.useEffect(() => { if (!editing) setDraft(note || ''); }, [note, editing]);
  React.useEffect(() => {
    if (editing && taRef.current) {
      taRef.current.focus();
      const v = taRef.current.value;
      taRef.current.setSelectionRange(v.length, v.length);
    }
  }, [editing]);

  // Hide entirely for visitors when there's no note
  if (!isOwner && !(note || '').trim()) {
    // Show a subtle placeholder so visitors at least know the feature exists
    return (
      <div className="wc-note-card" style={{
        maxWidth: 720, margin: '0 auto 24px', padding: '14px 24px',
        background: 'transparent',
        border: '1px dashed var(--wc-edge)',
        borderRadius: 16,
        textAlign: 'center',
        font: '400 11px/1.4 var(--wc-font-stamp)', color: 'var(--wc-ink-mute)',
        letterSpacing: '0.08em', textTransform: 'uppercase',
      }}>
        no note from {owner} yet
      </div>
    );
  }

  const commit = () => {
    const cleaned = (draft || '').trim();
    setEditing(false);
    if (cleaned !== (note || '').trim()) onSave(cleaned);
  };
  const cancel = () => { setDraft(note || ''); setEditing(false); };

  const hasNote = !!(note || '').trim();

  return (
    <div
      className="wc-note-card"
      onClick={() => { if (isOwner && !editing) setEditing(true); }}
      style={{
        maxWidth: 720, margin: '0 auto 24px', padding: '18px 24px 20px',
        background: 'var(--wc-paper, #FEFBF5)',
        border: '1px solid var(--wc-edge)',
        borderRadius: 16,
        boxShadow: 'var(--wc-shadow-sm)',
        position: 'relative',
        cursor: isOwner && !editing ? 'text' : 'default',
        transition: 'all 220ms var(--wc-ease-standard)',
      }}>
      {/* tape decor */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: -10, left: 28, width: 70, height: 20,
        background: 'rgba(245,199,110,0.7)',
        transform: 'rotate(-3deg)',
        boxShadow: '0 1px 3px rgba(46,61,68,0.08)',
      }}/>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        gap: 12, marginBottom: 8,
      }}>
        <div style={{
          font: '400 11px/1 var(--wc-font-stamp)', color: 'var(--wc-ink-mute)',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          a little note from {owner}
        </div>
        {isOwner && !editing && (
          <span style={{
            font: '400 10px/1 var(--wc-font-stamp)', color: 'var(--wc-ink-faint, var(--wc-ink-mute))',
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            tap to edit
          </span>
        )}
      </div>

      {editing ? (
        <>
          <textarea
            ref={taRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={e => {
              if (e.key === 'Escape') { e.preventDefault(); cancel(); }
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); commit(); }
            }}
            placeholder="leave a little note for today…"
            rows={2}
            maxLength={240}
            style={{
              width: '100%', display: 'block',
              font: '500 22px/1.35 var(--wc-font-hand)',
              color: 'var(--wc-ink)',
              background: 'transparent',
              border: 'none', outline: 'none', resize: 'none',
              padding: 0,
            }}
          />
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 12, marginTop: 8,
          }}>
            <span style={{
              font: '400 10px/1 var(--wc-font-stamp)', color: 'var(--wc-ink-mute)',
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              {240 - (draft || '').length} chars left · esc to cancel
            </span>
            <Button variant="primary" size="sm" onMouseDown={e => e.preventDefault()} onClick={commit}>
              save
            </Button>
          </div>
        </>
      ) : hasNote ? (
        <>
          <div style={{
            font: '500 22px/1.35 var(--wc-font-hand)', color: 'var(--wc-ink)',
            whiteSpace: 'pre-wrap', overflowWrap: 'break-word', textWrap: 'pretty',
          }}>
            {note}
          </div>
          {timeAgo(updatedAt) && (
            <div style={{
              font: '400 11px/1.2 var(--wc-font-body)', color: 'var(--wc-ink-mute)',
              marginTop: 8,
            }}>
              updated {timeAgo(updatedAt)}
            </div>
          )}
        </>
      ) : (
        <div style={{
          font: '500 22px/1.35 var(--wc-font-hand)', color: 'var(--wc-ink-mute)', fontStyle: 'italic',
        }}>
          leave a little note for today…
        </div>
      )}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────
// HERO — landing (decorative pandas only)
// ──────────────────────────────────────────────────────────────────────

const Hero = ({ owner = 'chiraswinireddy', count }) => (
  <section className="wc-hero" style={{ padding: '64px 40px 24px', textAlign: 'center', position: 'relative' }}>
    <div style={{ font: '500 18px var(--wc-font-hand)', color: 'var(--wc-sea)', marginBottom: 8 }}>
      a little cloud kept by
    </div>
    <h1 style={{
      font: '600 92px/0.95 var(--wc-font-hand)',
      color: 'var(--wc-ink)', margin: '0 0 16px',
    }}>
      w.inii's cloud
    </h1>
    <div style={{
      font: '400 13px/1 var(--wc-font-stamp)', color: 'var(--wc-ink-mute)',
      letterSpacing: '0.08em', textTransform: 'uppercase',
    }}>
      {count} {count === 1 ? 'picture' : 'pictures'} · kept by {owner}
    </div>
  </section>
);

// ──────────────────────────────────────────────────────────────────────
// FILTER BAR — month pills + layout toggle
// ──────────────────────────────────────────────────────────────────────

const FilterBar = ({ memories, monthFilter, onSetMonth, layout, onLayout }) => {
  const months = React.useMemo(() => {
    const present = new Set(memories.map(m => m.month));
    return MONTHS.filter(m => present.has(m));
  }, [memories]);

  return (
    <div style={{
      padding: '8px 40px 24px', maxWidth: 1200, margin: '0 auto',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 16, flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <Pill tone={monthFilter === 'all' ? 'sea' : 'default'} onClick={() => onSetMonth('all')}>all</Pill>
        {months.map(m => (
          <Pill key={m} tone={monthFilter === m ? 'sea' : 'default'} onClick={() => onSetMonth(m)}>
            {m.toLowerCase()}
          </Pill>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center',
        background: 'var(--wc-shell)', border: '1px solid var(--wc-edge)', borderRadius: 999, padding: 4 }}>
        {[
          { key: 'scattered', icon: 'scatter' },
          { key: 'grid',      icon: 'grid'    },
          { key: 'stream',    icon: 'stream'  },
        ].map(({ key, icon }) => (
          <button key={key} onClick={() => onLayout(key)} aria-label={key}
            style={{
              width: 32, height: 32, borderRadius: 999, border: 'none', cursor: 'pointer',
              background: layout === key ? 'var(--wc-sea)' : 'transparent',
              color: layout === key ? 'var(--wc-shell)' : 'var(--wc-ink-soft)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 220ms',
            }}>
            <Icon name={icon} size={16}/>
          </button>
        ))}
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────
// STICKER PICKER — per-polaroid sticker customization (owner only)
// ──────────────────────────────────────────────────────────────────────

const STICKER_OPTIONS = [
  { id: 'none',     label: 'no sticker' },
  { id: 'hi',       label: 'happy' },
  { id: 'love',     label: 'love' },
  { id: 'sad',      label: 'sad' },
  { id: 'thinking', label: 'thinking' },
  { id: 'float',    label: 'calm' },
  { id: 'sleepy',   label: 'sleepy' },
  { id: 'beach',    label: 'chill' },
];

const StickerPicker = ({ open, memory, onPick, onClose }) => {
  if (!open || !memory) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(46,61,68,0.78)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--wc-shell)', borderRadius: 20, maxWidth: 480, width: '100%',
        padding: 28, boxShadow: 'var(--wc-shadow-xl)', position: 'relative',
      }}>
        <IconButton icon={<Icon name="x" size={18}/>} onClick={onClose} label="close"
          style={{ position: 'absolute', top: 14, right: 14 }}/>
        <h2 style={{ font: '600 32px/1 var(--wc-font-hand)', margin: '0 0 4px', color: 'var(--wc-ink)' }}>
          add a sticker
        </h2>
        <div style={{ font: '500 13px/1.4 var(--wc-font-body)', color: 'var(--wc-ink-mute)', marginBottom: 18 }}>
          on “{memory.caption}”
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {STICKER_OPTIONS.map(opt => {
            const active = (memory.sticker || 'none') === opt.id;
            return (
              <button key={opt.id} onClick={() => onPick(opt.id)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  padding: '12px 6px',
                  background: active ? 'var(--wc-coral-tint)' : 'var(--wc-sand)',
                  border: `1.5px solid ${active ? 'var(--wc-coral)' : 'var(--wc-edge)'}`,
                  borderRadius: 14, cursor: 'pointer',
                  transition: 'all 220ms var(--wc-ease-standard)',
                  position: 'relative',
                }}>
                {opt.id === 'none' ? (
                  <div style={{
                    width: 56, height: 56, borderRadius: 999,
                    border: '2px dashed var(--wc-edge-strong)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--wc-ink-mute)',
                  }}>
                    <Icon name="x" size={20}/>
                  </div>
                ) : (
                  <img src={window.PANDA_URLS[opt.id]} alt="" width={56} height={56}/>
                )}
                <span style={{
                  font: '600 12px/1.2 var(--wc-font-body)',
                  color: active ? 'var(--wc-coral)' : 'var(--wc-ink)',
                  textAlign: 'center',
                }}>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────
// FEED — three layouts, optional month grouping
// ──────────────────────────────────────────────────────────────────────

const MonthDivider = ({ month, count }) => {
  const FULL = { JAN:'january', FEB:'february', MAR:'march', APR:'april', MAY:'may', JUN:'june', JUL:'july', AUG:'august', SEP:'september', OCT:'october', NOV:'november', DEC:'december' };
  return (
    <div style={{
      gridColumn: '1 / -1',
      display: 'flex', alignItems: 'baseline', gap: 16,
      padding: '40px 0 12px',
    }}>
      <div style={{ font: '600 56px/0.9 var(--wc-font-hand)', color: 'var(--wc-ink)' }}>
        {FULL[month] || month.toLowerCase()}
      </div>
      <div style={{ flex: 1, height: 1, background: 'var(--wc-edge)', alignSelf: 'center' }}/>
      <div style={{
        font: '400 11px/1 var(--wc-font-stamp)', color: 'var(--wc-ink-mute)',
        letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap',
      }}>
        {count} {count === 1 ? 'picture' : 'pictures'}
      </div>
    </div>
  );
};

const groupByMonth = (memories) => {
  // Sort: most recent first (by year desc, then month desc within year)
  const sorted = [...memories].sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    return MONTHS.indexOf(b.month) - MONTHS.indexOf(a.month);
  });
  const groups = [];
  for (const m of sorted) {
    const key = `${m.year}-${m.month}`;
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(m);
    else groups.push({ key, month: m.month, year: m.year, items: [m] });
  }
  return groups;
};

const Feed = ({ memories, layout, onOpen, showStickers, groupMonths, isOwner, onEditSticker }) => {
  if (memories.length === 0) return null;
  const groups = groupMonths ? groupByMonth(memories) : [{ key: 'flat', month: null, items: memories }];

  const renderPolaroids = (items, gridGap) => items.map((m, i) => {
    const rot = [-3, 2, -1.5, 3, -2.5, 1.5, -2, 2.5, -1][i % 9];
    return (
      <div key={m.id} style={{
        display: 'flex', justifyContent: 'center',
        transform: layout === 'scattered' ? `translateY(${(i % 3) * 18}px)` : 'none',
      }}>
        <Polaroid
          memory={m}
          rotation={layout === 'scattered' ? rot : 0}
          withTape={layout === 'scattered'}
          onClick={() => onOpen(m)}
          layout={layout}
          size={layout === 'stream' ? 'lg' : 'md'}
          isOwner={isOwner}
          onEditSticker={onEditSticker}
        />
      </div>
    );
  });

  if (layout === 'scattered' || layout === 'grid') {
    return (
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '8px 40px 96px', position: 'relative' }}>
        {groups.map(({ key, month, year, items }) => (
          <React.Fragment key={key}>
            {month && <MonthDivider month={month} count={items.length}/>}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              gap: layout === 'scattered' ? '48px 24px' : 24,
              marginBottom: month ? 16 : 0,
            }}>
              {renderPolaroids(items)}
            </div>
          </React.Fragment>
        ))}
        {showStickers && layout === 'scattered' && (
          <>
            <PandaSticker name="sleepy" size={76} style={{ position: 'absolute', right: 20, top: 240, transform: 'rotate(14deg)' }}/>
            <PandaSticker name="hi"     size={68} style={{ position: 'absolute', left: 10,  top: 540, transform: 'rotate(-12deg)' }}/>
          </>
        )}
      </div>
    );
  }
  // stream
  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '8px 40px 96px' }}>
      {groups.map(({ key, month, items }) => (
        <React.Fragment key={key}>
          {month && <MonthDivider month={month} count={items.length}/>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 64, alignItems: 'center', padding: '24px 0' }}>
            {items.map(m => (
              <Polaroid key={m.id} memory={m} rotation={0} withTape={false}
                onClick={() => onOpen(m)} layout="stream" size="lg"
                isOwner={isOwner} onEditSticker={onEditSticker}/>
            ))}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────
// LIGHTBOX
// ──────────────────────────────────────────────────────────────────────

const Lightbox = ({ memory, onClose, onPrev, onNext, isOwner, onDelete }) => {
  React.useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [memory, onClose, onPrev, onNext]);

  if (!memory) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(46,61,68,0.82)', backdropFilter: 'blur(14px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{ position: 'fixed', top: 24, right: 24, display: 'flex', gap: 8 }}>
        {isOwner && onDelete && (
          <IconButton icon={<Icon name="trash" size={18}/>} label="delete"
            onClick={e => { e.stopPropagation(); onDelete(memory.id); }}
            style={{ background: 'rgba(254,251,245,0.1)', border: '1px solid rgba(254,251,245,0.3)', color: 'var(--wc-shell)' }}/>
        )}
        <IconButton icon={<Icon name="x" size={18}/>} label="close" onClick={onClose}
          style={{ background: 'rgba(254,251,245,0.1)', border: '1px solid rgba(254,251,245,0.3)', color: 'var(--wc-shell)' }}/>
      </div>
      <button onClick={e => { e.stopPropagation(); onPrev(); }} aria-label="prev"
        style={{ position: 'fixed', left: 24, top: '50%', transform: 'translateY(-50%)',
          width: 44, height: 44, borderRadius: 999,
          background: 'rgba(254,251,245,0.1)', border: '1px solid rgba(254,251,245,0.3)',
          color: 'var(--wc-shell)', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="chevronL" size={20}/>
      </button>
      <button onClick={e => { e.stopPropagation(); onNext(); }} aria-label="next"
        style={{ position: 'fixed', right: 24, top: '50%', transform: 'translateY(-50%)',
          width: 44, height: 44, borderRadius: 999,
          background: 'rgba(254,251,245,0.1)', border: '1px solid rgba(254,251,245,0.3)',
          color: 'var(--wc-shell)', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="chevronR" size={20}/>
      </button>
      <div onClick={e => e.stopPropagation()}>
        <Polaroid memory={memory} rotation={0} withTape={true} size="lg" layout="lightbox"/>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────
// UPLOAD MODAL (owner)
// ──────────────────────────────────────────────────────────────────────

const UploadModal = ({ open, onClose, onSave }) => {
  const [caption, setCaption] = React.useState('');
  const [location, setLocation] = React.useState('');
  const now = new Date();
  const [month, setMonth] = React.useState(MONTHS[now.getMonth()]);
  const [year, setYear] = React.useState(now.getFullYear());
  const [dragging, setDragging] = React.useState(false);
  const [staged, setStaged] = React.useState(null);  // { dataURL, file }
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => setStaged({ dataURL: e.target.result, file });
    reader.readAsDataURL(file);
  };

  const reset = () => { setCaption(''); setLocation(''); setStaged(null); setUploading(false); };

  if (!open) return null;

  return (
    <div onClick={() => { onClose(); reset(); }} style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(46,61,68,0.78)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--wc-shell)', borderRadius: 20, maxWidth: 480, width: '100%',
        padding: 32, boxShadow: 'var(--wc-shadow-xl)', position: 'relative',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <IconButton icon={<Icon name="x" size={18}/>} onClick={() => { onClose(); reset(); }} label="close"
          style={{ position: 'absolute', top: 16, right: 16 }}/>
        <h2 style={{ font: '600 36px/1 var(--wc-font-hand)', margin: '0 0 6px', color: 'var(--wc-ink)' }}>
          keep one
        </h2>
        <div style={{ font: '500 13px/1.4 var(--wc-font-body)', color: 'var(--wc-ink-mute)', marginBottom: 20 }}>
          drop a photo on the cloud
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files[0])}/>

        <div
          onClick={() => !staged && fileInputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => {
            e.preventDefault(); setDragging(false);
            handleFile(e.dataTransfer.files[0]);
          }}
          style={{
            border: `2px dashed ${dragging ? 'var(--wc-coral)' : 'var(--wc-sea)'}`,
            background: dragging ? 'var(--wc-coral-tint)' : staged ? 'transparent' : 'rgba(201, 226, 236, 0.35)',
            borderRadius: 16, padding: staged ? 8 : 32,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            transition: 'all 220ms', minHeight: 180,
            cursor: staged ? 'default' : 'pointer',
            position: 'relative',
          }}>
          {staged ? (
            <>
              <img src={staged.dataURL} alt=""
                style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 8, display: 'block' }}/>
              <button onClick={e => { e.stopPropagation(); setStaged(null); }}
                style={{
                  position: 'absolute', top: 12, right: 12,
                  width: 32, height: 32, borderRadius: 999,
                  background: 'rgba(46,61,68,0.7)', border: 'none', color: '#fff',
                  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }} aria-label="replace photo">
                <Icon name="x" size={16}/>
              </button>
            </>
          ) : (
            <>
              <div style={{
                width: 56, height: 56, borderRadius: 999,
                background: 'var(--wc-shell)', border: '1.5px solid var(--wc-sea)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--wc-sea)',
              }}>
                <Icon name="upload" size={24}/>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ font: '600 16px/1.2 var(--wc-font-body)', color: 'var(--wc-ink)' }}>drop a photo here</div>
                <div style={{ font: '500 13px/1.4 var(--wc-font-body)', color: 'var(--wc-ink-mute)', marginTop: 4 }}>
                  or click to browse · jpg, png, heic
                </div>
              </div>
            </>
          )}
        </div>

        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Field label="caption">
            <textarea value={caption} onChange={e => setCaption(e.target.value)}
              placeholder="say something soft"
              style={{
                font: '500 20px/1.2 var(--wc-font-hand)',
                background: 'var(--wc-shell)', border: '1px solid var(--wc-edge-strong)',
                borderRadius: 12, padding: '10px 14px', color: 'var(--wc-ink)',
                outline: 'none', resize: 'none', minHeight: 48,
              }}/>
          </Field>
          <Field label="where was this? (optional)">
            <input type="text" value={location} onChange={e => setLocation(e.target.value)}
              placeholder="e.g. goa beach, home, mumbai cafe"
              style={{
                font: '500 15px/1.4 var(--wc-font-body)',
                background: 'var(--wc-shell)', border: '1px solid var(--wc-edge-strong)',
                borderRadius: 12, padding: '11px 14px', color: 'var(--wc-ink)', outline: 'none',
              }}/>
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="month">
              <select value={month} onChange={e => setMonth(e.target.value)}
                style={{
                  font: '500 15px/1.4 var(--wc-font-body)',
                  background: 'var(--wc-shell)', border: '1px solid var(--wc-edge-strong)',
                  borderRadius: 12, padding: '11px 14px', color: 'var(--wc-ink)', outline: 'none',
                }}>
                {MONTHS.map(m => <option key={m} value={m}>{m.toLowerCase()}</option>)}
              </select>
            </Field>
            <Field label="year">
              <input type="number" value={year} onChange={e => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                style={{
                  font: '500 15px/1.4 var(--wc-font-body)',
                  background: 'var(--wc-shell)', border: '1px solid var(--wc-edge-strong)',
                  borderRadius: 12, padding: '11px 14px', color: 'var(--wc-ink)', outline: 'none',
                }}/>
            </Field>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
          <Button variant="ghost" size="sm" onClick={() => { onClose(); reset(); }} disabled={uploading}>cancel</Button>
          <Button variant="primary" size="md" disabled={!staged || uploading} onClick={async () => {
            setUploading(true);
            try {
              await onSave({
                caption: caption || 'untitled',
                month, year,
                location: location.trim() || null,
                file: staged.file,
              });
              reset();
            } catch (e) {
              setUploading(false);
            }
          }}>
            {uploading ? 'tucking it in…' : 'tuck it in'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <span style={{ font: '400 10px/1 var(--wc-font-stamp)', color: 'var(--wc-ink-mute)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
      {label}
    </span>
    {children}
  </label>
);

// ──────────────────────────────────────────────────────────────────────
// LOGIN MODAL (owner) — real credential check
// ──────────────────────────────────────────────────────────────────────

const LoginModal = ({ open, onClose, onLogin }) => {
  const [email, setEmail] = React.useState('');
  const [pw, setPw] = React.useState('');
  const [error, setError] = React.useState('');
  const [showPw, setShowPw] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open) { setEmail(''); setPw(''); setError(''); setLoading(false); }
  }, [open]);

  if (!open) return null;

  const attempt = async () => {
    setLoading(true); setError('');
    try {
      await onLogin(email.trim(), pw);
    } catch (e) {
      setError(e.message || 'that\'s not right · try again');
      setLoading(false);
    }
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(46,61,68,0.78)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--wc-shell)', borderRadius: 20, maxWidth: 400, width: '100%',
        padding: '40px 32px', boxShadow: 'var(--wc-shadow-xl)', position: 'relative',
        textAlign: 'center',
      }}>
        <IconButton icon={<Icon name="x" size={18}/>} onClick={onClose} label="close"
          style={{ position: 'absolute', top: 16, right: 16 }}/>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <CloudGlyph size={70}/>
        </div>
        <h2 style={{ font: '600 36px/1 var(--wc-font-hand)', margin: '12px 0 6px', color: 'var(--wc-ink)' }}>
          let yourself in
        </h2>
        <div style={{ font: '500 13px/1.4 var(--wc-font-body)', color: 'var(--wc-ink-mute)', marginBottom: 20 }}>
          only w.inii can keep things here
        </div>
        <form onSubmit={e => { e.preventDefault(); attempt(); }}
          style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email" autoFocus autoComplete="email"
            style={{ font: '500 15px var(--wc-font-body)', background: 'var(--wc-sand)',
              border: `1px solid ${error ? 'var(--wc-danger)' : 'var(--wc-edge-strong)'}`, borderRadius: 12, padding: '12px 14px',
              color: 'var(--wc-ink)', outline: 'none' }}/>
          <div style={{ position: 'relative' }}>
            <input type={showPw ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)} placeholder="password" autoComplete="current-password"
              style={{ width: '100%', font: '500 15px var(--wc-font-body)', background: 'var(--wc-sand)',
                border: `1px solid ${error ? 'var(--wc-danger)' : 'var(--wc-edge-strong)'}`, borderRadius: 12, padding: '12px 14px',
                paddingRight: 56, color: 'var(--wc-ink)', outline: 'none', boxSizing: 'border-box' }}/>
            <button type="button" onClick={() => setShowPw(s => !s)}
              style={{
                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                background: 'transparent', border: 'none', cursor: 'pointer',
                font: '500 11px var(--wc-font-stamp)', color: 'var(--wc-ink-mute)',
                letterSpacing: '0.06em', textTransform: 'uppercase', padding: '4px 8px',
              }}>
              {showPw ? 'hide' : 'show'}
            </button>
          </div>
          {error && (
            <div style={{
              font: '500 12px var(--wc-font-body)', color: 'var(--wc-danger)',
              padding: '6px 10px', background: 'var(--wc-coral-tint)', borderRadius: 8,
            }}>{error}</div>
          )}
          <Button variant="primary" size="lg" type="submit" disabled={loading || !email || !pw}
            style={{ marginTop: 10, width: '100%', justifyContent: 'center' }}>
            {loading ? 'opening…' : 'let yourself in'}
          </Button>
        </form>
        <div style={{ font: '400 11px var(--wc-font-stamp)', color: 'var(--wc-ink-mute)',
          letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 20 }}>
          visitors can keep scrolling →
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────
// FOOTER
// ──────────────────────────────────────────────────────────────────────

const Footer = () => (
  <footer style={{
    padding: '32px 40px', borderTop: '1px solid var(--wc-edge)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    color: 'var(--wc-ink-mute)', font: '400 12px/1 var(--wc-font-stamp)',
    letterSpacing: '0.06em', textTransform: 'uppercase',
  }}>
    <span>· kept by w.inii ·</span>
  </footer>
);

Object.assign(window, { Hero, MoodCard, MoodPicker, DailyNoteCard, StickerPicker, MOODS, STICKER_OPTIONS, findMood, FilterBar, Feed, Lightbox, UploadModal, LoginModal, Footer, MEMORIES });
