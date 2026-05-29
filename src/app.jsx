/* w.inii's cloud — main app with Supabase backend */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "layout": "scattered",
  "stickers": true,
  "background": "sand"
}/*EDITMODE-END*/;

const App = () => {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Auth + ownership (real, from Supabase)
  const [session, setSession] = React.useState(null);
  const [authLoading, setAuthLoading] = React.useState(true);

  // Data
  const [memories, setMemories] = React.useState([]);
  const [mood, setMood] = React.useState('happy');
  const [note, setNote] = React.useState('');
  const [moodUpdatedAt, setMoodUpdatedAt] = React.useState(null);
  const [noteUpdatedAt, setNoteUpdatedAt] = React.useState(null);
  const [painting, setPainting] = React.useState('');
  const [stamps, setStamps] = React.useState([]);
  const [doodles, setDoodles] = React.useState([]);
  const [background, setBackground] = React.useState('sand');
  const [dataLoading, setDataLoading] = React.useState(true);
  const [dataError, setDataError] = React.useState(null);

  // UI state
  const [monthFilter, setMonthFilter] = React.useState('all');
  const [activeId, setActiveId] = React.useState(null);
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [loginOpen, setLoginOpen] = React.useState(false);
  const [moodOpen, setMoodOpen] = React.useState(false);
  const [stickerFor, setStickerFor] = React.useState(null);
  const [stampsOpen, setStampsOpen] = React.useState(false);
  const [addStampOpen, setAddStampOpen] = React.useState(false);
  const [paintEditorOpen, setPaintEditorOpen] = React.useState(false);
  const [sketchbookOpen, setSketchbookOpen] = React.useState(false);
  const [toast, setToast] = React.useState(null);

  const isOwner = SB.isOwner(session);

  // ---------- Init: session + data ----------
  React.useEffect(() => {
    SB.getSession().then(s => { setSession(s); setAuthLoading(false); });
    const { data: sub } = SB.onAuthChange(s => setSession(s));
    return () => sub?.subscription?.unsubscribe();
  }, []);

  const reload = React.useCallback(async () => {
    setDataLoading(true); setDataError(null);
    try {
      const [mems, m, n, p, st, bg, dd, meta] = await Promise.all([
        SB.listMemories(), SB.getMood(), SB.getNote(), SB.getPainting(), SB.listStamps(), SB.getBackground(), SB.listDoodles(), SB.getCloudMeta(),
      ]);
      setMemories(mems);
      setMood(m);
      setNote(n);
      setPainting(p);
      setStamps(st);
      setBackground(bg);
      setDoodles(dd);
      setMoodUpdatedAt(meta.moodUpdatedAt);
      setNoteUpdatedAt(meta.noteUpdatedAt);
    } catch (e) {
      console.error(e);
      setDataError(e.message || 'could not load');
    } finally {
      setDataLoading(false);
    }
  }, []);

  React.useEffect(() => { reload(); }, [reload]);

  // Realtime: visitors see new uploads + mood changes without refresh
  React.useEffect(() => {
    const ch1 = SB.subscribeMemories(() => reload());
    const ch2 = SB.subscribeMood((m, ts) => { setMood(m); if (ts) setMoodUpdatedAt(ts); });
    const ch3 = SB.subscribeNote((n, ts) => { setNote(n); if (ts) setNoteUpdatedAt(ts); });
    const ch4 = SB.subscribePainting(p => setPainting(p));
    const ch5 = SB.subscribeStamps(() => SB.listStamps().then(setStamps).catch(() => {}));
    const ch6 = SB.subscribeBackground(bg => setBackground(bg));
    const ch7 = SB.subscribeDoodles(() => SB.listDoodles().then(setDoodles).catch(() => {}));
    return () => {
      SB.client.removeChannel(ch1);
      SB.client.removeChannel(ch2);
      SB.client.removeChannel(ch3);
      SB.client.removeChannel(ch4);
      SB.client.removeChannel(ch5);
      SB.client.removeChannel(ch6);
      SB.client.removeChannel(ch7);
    };
  }, [reload]);

  // ---------- Filtering ----------
  const filtered = React.useMemo(() => {
    if (monthFilter === 'all') return memories;
    return memories.filter(m => m.month === monthFilter);
  }, [monthFilter, memories]);

  const activeMemory = filtered.find(m => m.id === activeId);
  const activeIdx = filtered.findIndex(m => m.id === activeId);
  const openMemory  = m => setActiveId(m.id);
  const closeLB     = () => setActiveId(null);
  const prevMemory  = () => filtered.length && setActiveId(filtered[(activeIdx - 1 + filtered.length) % filtered.length].id);
  const nextMemory  = () => filtered.length && setActiveId(filtered[(activeIdx + 1) % filtered.length].id);

  // ---------- Owner actions ----------
  const flash = (msg, kind = 'ok') => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 2400);
  };

  const onSave = async ({ caption, month, year, file }) => {
    try {
      const m = await SB.addMemory({ caption, month, year, file });
      setMemories(prev => [m, ...prev]);
      setUploadOpen(false);
      flash('kept ✓');
    } catch (e) {
      console.error(e);
      flash(e.message || 'could not save', 'err');
    }
  };

  const onDelete = async (id) => {
    if (!confirm('forget this one? this cannot be undone.')) return;
    const m = memories.find(x => x.id === id);
    try {
      await SB.deleteMemory(id, m?._photoPath);
      setMemories(memories.filter(x => x.id !== id));
      setActiveId(null);
      flash('forgotten');
    } catch (e) {
      flash(e.message || 'could not delete', 'err');
    }
  };

  const onSetMood = async (newMood) => {
    setMood(newMood);
    setMoodUpdatedAt(new Date().toISOString());
    setMoodOpen(false);
    try { await SB.setMood(newMood); }
    catch (e) { flash(e.message || 'could not save mood', 'err'); reload(); }
  };

  const onSetNote = async (newNote) => {
    const prev = note;
    setNote(newNote);
    setNoteUpdatedAt(new Date().toISOString());
    try { await SB.setNote(newNote); flash(newNote ? 'note saved ✓' : 'note cleared'); }
    catch (e) { setNote(prev); flash(e.message || 'could not save note', 'err'); }
  };

  const onSavePainting = async (dataUrl) => {
    const prev = painting;
    setPainting(dataUrl);
    try {
      await SB.setPainting(dataUrl);
      // Also archive it (so the sketchbook keeps a copy)
      try {
        const d = await SB.addDoodleToArchive(dataUrl);
        setDoodles(prev => [d, ...prev]);
      } catch (archErr) {
        console.warn('doodle archive failed (not fatal)', archErr);
      }
      flash('doodle saved ✓');
    }
    catch (e) { setPainting(prev); flash(e.message || 'could not save doodle', 'err'); throw e; }
  };

  const onClearPainting = async () => {
    setPainting('');
    try { await SB.setPainting(''); flash('cleared'); }
    catch (e) { flash(e.message || 'could not clear', 'err'); reload(); }
  };

  const onDeleteDoodle = async (d) => {
    try {
      await SB.deleteDoodle(d.id, d._photoPath);
      setDoodles(prev => prev.filter(x => x.id !== d.id));
      flash('forgotten');
    } catch (e) {
      flash(e.message || 'could not delete', 'err');
    }
  };

  const onAddStamp = async (blob) => {
    try {
      const s = await SB.addStamp(blob);
      setStamps(prev => [s, ...prev]);
      setAddStampOpen(false);
      flash('stamp added ✓');
    } catch (e) {
      console.error(e);
      flash(e.message || 'could not save stamp', 'err');
      throw e;
    }
  };

  const onDeleteStamp = async (s) => {
    if (!confirm('forget this stamp?')) return;
    try {
      await SB.deleteStamp(s.id, s._photoPath);
      setStamps(prev => prev.filter(x => x.id !== s.id));
      flash('forgotten');
    } catch (e) {
      flash(e.message || 'could not delete stamp', 'err');
    }
  };

  const onSetSticker = async (newSticker) => {
    if (!stickerFor) return;
    const rot = stickerFor.stickerRot ?? (Math.random() * 30 - 15);
    setMemories(memories.map(m => m.id === stickerFor.id
      ? { ...m, sticker: newSticker, stickerRot: rot } : m));
    setStickerFor(null);
    try { await SB.updateMemorySticker(stickerFor.id, newSticker, rot); }
    catch (e) { flash(e.message || 'could not save sticker', 'err'); reload(); }
  };

  // ---------- Login flow ----------
  const onLoginSubmit = async (email, password) => {
    const user = await SB.signIn(email, password);  // throws on error
    if (user.email?.toLowerCase() !== SB.OWNER_EMAIL.toLowerCase()) {
      await SB.signOut();
      throw new Error('this account isn\'t the owner');
    }
    setLoginOpen(false);
  };

  const onLogout = async () => {
    await SB.signOut();
  };

  // background is owner-controlled and persisted in Supabase.
  // visitors see whatever the owner last picked. The tweaks-panel value
  // is only used as a fallback before data loads.
  const bgChoice = background || tweaks.background || 'sand';
  const bg = bgChoice === 'foam' ? 'var(--wc-foam)' : 'var(--wc-sand)';

  // Keep <html>/<body> background in sync with the chosen background so
  // mobile overscroll (rubber-band) and any gap show the matching color,
  // never a mismatched fallback.
  React.useEffect(() => {
    document.documentElement.style.background = bg;
    document.body.style.background = bg;
  }, [bg]);

  const onSetBackground = async (newBg) => {
    const prev = background;
    setBackground(newBg);
    setTweak('background', newBg);
    if (isOwner) {
      try { await SB.setBackground(newBg); flash('background saved ✓'); }
      catch (e) { setBackground(prev); flash(e.message || 'could not save background', 'err'); }
    }
  };
  const ownerName = 'chiraswinireddy';

  // ---------- Loading state ----------
  if (authLoading || dataLoading) {
    return (
      <div className="wc" style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <CloudGlyph size={90}/>
          <div style={{ font: '600 28px var(--wc-font-hand)', color: 'var(--wc-ink)', marginTop: 8 }}>
            opening the cloud…
          </div>
        </div>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="wc" style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <CloudGlyph size={70}/>
          <div style={{ font: '600 28px var(--wc-font-hand)', color: 'var(--wc-ink)', marginTop: 8 }}>
            couldn't reach the cloud
          </div>
          <div style={{ font: '500 13px var(--wc-font-body)', color: 'var(--wc-ink-mute)', marginTop: 8, marginBottom: 16 }}>
            {dataError}
          </div>
          <Button variant="primary" size="md" onClick={reload}>try again</Button>
          <div style={{ font: '400 11px var(--wc-font-stamp)', color: 'var(--wc-ink-mute)', marginTop: 20, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            tip — did you run the setup SQL?
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wc wc-grain" style={{ minHeight: '100vh', background: bg }}>
      <Header
        owner={ownerName}
        isOwner={isOwner}
        onLogin={() => setLoginOpen(true)}
        onAdd={() => setUploadOpen(true)}
        onLogout={onLogout}
        background={bgChoice}
        onSetBackground={onSetBackground}
      />
      <Hero owner={ownerName} count={memories.length}/>
      <div className="wc-status-grid">
        <div className="wc-status-col">
          <MoodCard
            mood={mood}
            isOwner={isOwner}
            owner={ownerName}
            updatedAt={moodUpdatedAt}
            onEdit={() => setMoodOpen(true)}
          />
          <DailyNoteCard
            note={note}
            isOwner={isOwner}
            owner={ownerName}
            updatedAt={noteUpdatedAt}
            onSave={onSetNote}
          />
          <StampsCard
            stamps={stamps}
            isOwner={isOwner}
            owner={ownerName}
            onAdd={() => setAddStampOpen(true)}
            onOpenAll={() => setStampsOpen(true)}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <PaintBoard
            painting={painting}
            isOwner={isOwner}
            owner={ownerName}
            onOpenEditor={() => setPaintEditorOpen(true)}
          />
          {doodles.length > 0 && (
            <div style={{ maxWidth: 480, width: '100%', margin: '0 auto' }}>
              <SketchbookStrip
                doodles={doodles}
                onOpenAll={() => setSketchbookOpen(true)}
                onOpenOne={() => setSketchbookOpen(true)}
              />
            </div>
          )}
        </div>
      </div>
      <FilterBar
        memories={memories}
        monthFilter={monthFilter} onSetMonth={setMonthFilter}
        layout={tweaks.layout}    onLayout={l => setTweak('layout', l)}
      />
      {filtered.length === 0 ? (
        <EmptyState isOwner={isOwner} monthFilter={monthFilter}
          onAdd={() => setUploadOpen(true)} owner={ownerName}/>
      ) : (
        <Feed
          memories={filtered}
          layout={tweaks.layout}
          onOpen={openMemory}
          showStickers={tweaks.stickers && tweaks.layout === 'scattered'}
          groupMonths={false}
          isOwner={isOwner}
          onEditSticker={m => setStickerFor(m)}
        />
      )}
      <Footer/>

      <PaintEditorModal
        open={paintEditorOpen}
        painting={painting}
        onClose={() => setPaintEditorOpen(false)}
        onKeep={async (dataUrl) => { await onSavePainting(dataUrl); setPaintEditorOpen(false); }}
        onClear={onClearPainting}
      />
      <SketchbookModal
        open={sketchbookOpen}
        doodles={doodles}
        isOwner={isOwner}
        onClose={() => setSketchbookOpen(false)}
        onDelete={onDeleteDoodle}
      />

      <Lightbox
        memory={activeMemory}
        onClose={closeLB}
        onPrev={prevMemory}
        onNext={nextMemory}
        isOwner={isOwner}
        onDelete={onDelete}
      />
      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} onSave={onSave}/>
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLogin={onLoginSubmit}
      />
      <MoodPicker
        open={moodOpen}
        value={mood}
        onPick={onSetMood}
        onClose={() => setMoodOpen(false)}
      />
      <StickerPicker
        open={!!stickerFor}
        memory={stickerFor}
        onPick={onSetSticker}
        onClose={() => setStickerFor(null)}
      />
      <StampsModal
        open={stampsOpen}
        stamps={stamps}
        isOwner={isOwner}
        onClose={() => setStampsOpen(false)}
        onAdd={() => { setStampsOpen(false); setAddStampOpen(true); }}
        onDelete={onDeleteStamp}
      />
      <AddStampModal
        open={addStampOpen}
        onClose={() => setAddStampOpen(false)}
        onSave={onAddStamp}
      />

      {toast && <Toast msg={toast.msg} kind={toast.kind}/>}

      <TweaksPanel title="Tweaks">
        <TweakSection title="Layout">
          <TweakSelect label="feed style" options={[
            { value: 'scattered', label: 'Scattered polaroids' },
            { value: 'grid',      label: 'Clean grid' },
            { value: 'stream',    label: 'Single stream' },
          ]} value={tweaks.layout} onChange={v => setTweak('layout', v)}/>
          <TweakRadio label={isOwner ? 'background (saves for everyone)' : 'background (preview — owner only saves)'} options={[
            { value: 'sand', label: 'Sand' },
            { value: 'foam', label: 'Foam' },
          ]} value={bgChoice} onChange={onSetBackground}/>
        </TweakSection>
        <TweakSection title="Decoration">
          <TweakToggle label="panda stickers in feed" value={tweaks.stickers} onChange={v => setTweak('stickers', v)}/>
        </TweakSection>
        <TweakSection title="Account">
          <div style={{ font: '500 13px var(--wc-font-body)', color: 'var(--wc-ink-soft)', lineHeight: 1.5 }}>
            {isOwner ? <>signed in as <strong>{session.user.email}</strong></> : 'visitor mode · only owner can edit'}
          </div>
          {isOwner
            ? <Button variant="secondary" size="sm" onClick={onLogout}>sign out</Button>
            : <Button variant="primary" size="sm" onClick={() => setLoginOpen(true)} icon={<Icon name="lock" size={14}/>}>owner sign in</Button>}
        </TweakSection>
      </TweaksPanel>
    </div>
  );
};

const Toast = ({ msg, kind }) => (
  <div style={{
    position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
    background: kind === 'err' ? 'var(--wc-danger)' : 'var(--wc-ink)',
    color: 'var(--wc-shell)', padding: '12px 20px', borderRadius: 999,
    font: '600 14px var(--wc-font-body)', boxShadow: 'var(--wc-shadow-lg)',
    zIndex: 200, animation: 'fadeIn 220ms var(--wc-ease-standard)',
  }}>{msg}</div>
);

const EmptyState = ({ isOwner, monthFilter, onAdd, owner }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 10, padding: '64px 24px 96px', textAlign: 'center',
  }}>
    <PandaSticker name="sleepy" size={120}/>
    <div style={{ font: '600 40px/1 var(--wc-font-hand)', marginTop: 12 }}>
      nothing here yet
    </div>
    <p style={{ color: 'var(--wc-ink-mute)', maxWidth: 400 }}>
      {monthFilter !== 'all'
        ? `no pictures from ${monthFilter.toLowerCase()}.`
        : isOwner
          ? 'tap "keep one" up top to add your first picture.'
          : `${owner} hasn't kept anything yet. check back soon.`}
    </p>
    {isOwner && monthFilter === 'all' && (
      <Button variant="primary" size="md" icon={<Icon name="plus" size={14}/>} onClick={onAdd}>
        keep your first one
      </Button>
    )}
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
