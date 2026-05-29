/* w.inii's cloud — Supabase client + helpers.
   Loaded after the supabase-js UMD script.
   Exposes window.SB with all backend operations. */

const SUPABASE_URL = 'https://eepkmoeahnepxcdxvfrk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Fco_kPzVFmhx9QCOYo16eg_qOBq_0f0';
const OWNER_EMAIL = 'chiraswinireddy02@gmail.com';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Convert Supabase row to UI memory shape
const fromRow = (m) => ({
  id: m.id,
  caption: m.caption || '',
  month: m.month,
  year: m.year,
  location: m.location || '',
  sticker: m.sticker || null,
  stickerRot: m.sticker_rot || 0,
  tapeRot: m.tape_rot || -2,
  tapeColor: m.tape_color || 'yellow',
  photoSrc: sb.storage.from('photos').getPublicUrl(m.photo_path).data.publicUrl,
  _photoPath: m.photo_path,
});

window.SB = {
  client: sb,
  OWNER_EMAIL,
  url: SUPABASE_URL,

  // ---------- Auth ----------
  async signIn(email, password) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  },
  async signOut() {
    await sb.auth.signOut();
  },
  async getSession() {
    const { data } = await sb.auth.getSession();
    return data.session;
  },
  onAuthChange(cb) {
    return sb.auth.onAuthStateChange((event, session) => cb(session));
  },
  isOwner(session) {
    return !!session && session.user?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();
  },

  // ---------- Memories ----------
  async listMemories() {
    const { data, error } = await sb
      .from('memories')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(fromRow);
  },

  async addMemory({ caption, month, year, location, file }) {
    const safeName = file.name.replace(/[^\w.-]/g, '_');
    const path = `${Date.now()}-${safeName}`;
    const { error: upErr } = await sb.storage.from('photos').upload(path, file, {
      cacheControl: '3600', upsert: false,
    });
    if (upErr) throw upErr;

    const { data, error } = await sb.from('memories').insert({
      caption, month, year, location: location || null, photo_path: path,
      tape_rot: -3 + Math.random() * 6,
      tape_color: Math.random() > 0.5 ? 'yellow' : 'coral',
    }).select().single();
    if (error) {
      // rollback upload
      await sb.storage.from('photos').remove([path]).catch(() => {});
      throw error;
    }
    return fromRow(data);
  },

  async updateMemorySticker(id, sticker, stickerRot) {
    const { error } = await sb.from('memories').update({
      sticker: sticker === 'none' ? null : sticker,
      sticker_rot: stickerRot,
    }).eq('id', id);
    if (error) throw error;
  },

  async deleteMemory(id, photoPath) {
    if (photoPath) {
      await sb.storage.from('photos').remove([photoPath]).catch(() => {});
    }
    const { error } = await sb.from('memories').delete().eq('id', id);
    if (error) throw error;
  },

  // ---------- Mood ----------
  async getMood() {
    const { data, error } = await sb.from('cloud_state').select('mood').eq('id', 1).maybeSingle();
    if (error) return 'happy';
    return data?.mood || 'happy';
  },

  // Returns { moodUpdatedAt, noteUpdatedAt } — null-safe if columns missing.
  async getCloudMeta() {
    const { data, error } = await sb.from('cloud_state')
      .select('mood_updated_at, note_updated_at').eq('id', 1).maybeSingle();
    if (error) return { moodUpdatedAt: null, noteUpdatedAt: null };
    return { moodUpdatedAt: data?.mood_updated_at || null, noteUpdatedAt: data?.note_updated_at || null };
  },

  async setMood(mood) {
    const now = new Date().toISOString();
    const { error } = await sb.from('cloud_state').update({
      mood, updated_at: now, mood_updated_at: now,
    }).eq('id', 1);
    if (error) throw error;
  },

  // ---------- Daily note ----------
  // Stored on cloud_state.daily_note (text).
  // REQUIRED SQL once:
  //   ALTER TABLE cloud_state ADD COLUMN IF NOT EXISTS daily_note text;
  async getNote() {
    const { data, error } = await sb.from('cloud_state').select('daily_note').eq('id', 1).maybeSingle();
    if (error) {
      console.warn('[SB.getNote] failed — did you add the daily_note column?', error.message);
      return '';
    }
    return data?.daily_note || '';
  },

  async setNote(note) {
    const now = new Date().toISOString();
    const { error } = await sb.from('cloud_state').update({
      daily_note: note, updated_at: now, note_updated_at: now,
    }).eq('id', 1);
    if (error) {
      console.error('[SB.setNote] failed — did you add the daily_note column?', error);
      throw new Error(error.message?.includes('daily_note')
        ? 'add the daily_note column to cloud_state first (see README)'
        : (error.message || 'save failed'));
    }
  },

  // ---------- Background (Sand / Foam — owner-controlled, shared) ----------
  // REQUIRED SQL once:
  //   ALTER TABLE cloud_state ADD COLUMN IF NOT EXISTS background text DEFAULT 'sand';
  async getBackground() {
    const { data, error } = await sb.from('cloud_state').select('background').eq('id', 1).maybeSingle();
    if (error) {
      console.warn('[SB.getBackground] failed — did you add the background column?', error.message);
      return 'sand';
    }
    return data?.background || 'sand';
  },

  async setBackground(bg) {
    const { error } = await sb.from('cloud_state').update({
      background: bg, updated_at: new Date().toISOString(),
    }).eq('id', 1);
    if (error) {
      console.error('[SB.setBackground] failed — did you add the background column?', error);
      throw new Error(error.message?.includes('background')
        ? 'add the background column to cloud_state first (see README)'
        : (error.message || 'save failed'));
    }
  },

  // ---------- Painting (today's doodle) ----------
  // Stored as a PNG data URL on cloud_state.painting (text).
  // REQUIRED SQL once:
  //   ALTER TABLE cloud_state ADD COLUMN IF NOT EXISTS painting text;
  async getPainting() {
    const { data, error } = await sb.from('cloud_state').select('painting').eq('id', 1).maybeSingle();
    if (error) {
      console.warn('[SB.getPainting] failed — did you add the painting column?', error.message);
      return '';
    }
    return data?.painting || '';
  },

  async setPainting(dataUrl) {
    const { error } = await sb.from('cloud_state').update({
      painting: dataUrl, updated_at: new Date().toISOString(),
    }).eq('id', 1);
    if (error) {
      console.error('[SB.setPainting] failed — did you add the painting column?', error);
      throw new Error(error.message?.includes('painting')
        ? 'add the painting column to cloud_state first (see README)'
        : (error.message || 'save failed'));
    }
  },

  // ---------- Stamps collection ----------
  // Photos are stored in the `photos` bucket under `stamps/` prefix.
  // Each stamp gets a row in the `stamps` table referencing its path.
  // REQUIRED SQL once: see README for the migration block.
  async listStamps() {
    const { data, error } = await sb
      .from('stamps')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('[SB.listStamps]', error.message);
      return [];
    }
    return data.map(s => ({
      id: s.id,
      rotation: s.rotation || 0,
      src: sb.storage.from('photos').getPublicUrl(s.photo_path).data.publicUrl,
      _photoPath: s.photo_path,
      createdAt: s.created_at,
    }));
  },

  async addStamp(blob, rotation = 0) {
    const path = `stamps/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
    const { error: upErr } = await sb.storage.from('photos').upload(path, blob, {
      contentType: 'image/png', cacheControl: '3600', upsert: false,
    });
    if (upErr) throw upErr;
    const { data, error } = await sb.from('stamps').insert({
      photo_path: path, rotation,
    }).select().single();
    if (error) {
      await sb.storage.from('photos').remove([path]).catch(() => {});
      throw error;
    }
    return {
      id: data.id,
      rotation: data.rotation || 0,
      src: sb.storage.from('photos').getPublicUrl(path).data.publicUrl,
      _photoPath: path,
    };
  },

  async deleteStamp(id, photoPath) {
    if (photoPath) {
      await sb.storage.from('photos').remove([photoPath]).catch(() => {});
    }
    const { error } = await sb.from('stamps').delete().eq('id', id);
    if (error) throw error;
  },

  // ---------- Sketchbook (saved doodles archive) ----------
  // Doodle PNGs live in `photos` bucket under `doodles/` prefix.
  // Each saved doodle gets a row in the `doodles` table.
  async listDoodles() {
    const { data, error } = await sb
      .from('doodles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('[SB.listDoodles]', error.message);
      return [];
    }
    return data.map(d => ({
      id: d.id,
      src: sb.storage.from('photos').getPublicUrl(d.photo_path).data.publicUrl,
      _photoPath: d.photo_path,
      createdAt: d.created_at,
    }));
  },

  async addDoodleToArchive(dataUrl) {
    // dataUrl -> Blob -> upload -> row
    const blob = await (await fetch(dataUrl)).blob();
    const path = `doodles/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
    const { error: upErr } = await sb.storage.from('photos').upload(path, blob, {
      contentType: 'image/png', cacheControl: '3600', upsert: false,
    });
    if (upErr) throw upErr;
    const { data, error } = await sb.from('doodles').insert({ photo_path: path }).select().single();
    if (error) {
      await sb.storage.from('photos').remove([path]).catch(() => {});
      throw error;
    }
    return {
      id: data.id,
      src: sb.storage.from('photos').getPublicUrl(path).data.publicUrl,
      _photoPath: path,
      createdAt: data.created_at,
    };
  },

  async deleteDoodle(id, photoPath) {
    if (photoPath) {
      await sb.storage.from('photos').remove([photoPath]).catch(() => {});
    }
    const { error } = await sb.from('doodles').delete().eq('id', id);
    if (error) throw error;
  },

  subscribeDoodles(onChange) {
    return sb.channel('doodles-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'doodles' }, onChange)
      .subscribe();
  },

  // ---------- Realtime (visitors see updates without refresh) ----------
  subscribeMemories(onChange) {
    return sb.channel('memories-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'memories' }, onChange)
      .subscribe();
  },
  subscribeMood(onChange) {
    return sb.channel('mood-rt')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'cloud_state' }, payload => {
        onChange(payload.new.mood, payload.new.mood_updated_at || null);
      })
      .subscribe();
  },
  subscribeNote(onChange) {
    return sb.channel('note-rt')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'cloud_state' }, payload => {
        onChange(payload.new.daily_note || '', payload.new.note_updated_at || null);
      })
      .subscribe();
  },
  subscribePainting(onChange) {
    return sb.channel('painting-rt')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'cloud_state' }, payload => {
        onChange(payload.new.painting || '');
      })
      .subscribe();
  },
  subscribeStamps(onChange) {
    return sb.channel('stamps-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stamps' }, onChange)
      .subscribe();
  },
  subscribeBackground(onChange) {
    return sb.channel('bg-rt')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'cloud_state' }, payload => {
        onChange(payload.new.background || 'sand');
      })
      .subscribe();
  },
};
