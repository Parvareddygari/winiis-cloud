# w.inii's cloud ☁️

A soft, personal keepsake site — a shared little corner of the internet for
photos, moods, daily notes, doodles, and postage-stamp memories. Visitors can
look around; the owner signs in to add and edit everything live.

🌐 **Live:** https://winiiscloud.netlify.app

---

## ✨ Features

- **Memory feed** — polaroid photos with caption, date, and location
- **Mood** — pick today's mood (shows when it was last updated)
- **Daily note** — a short message, with last-updated time
- **Doodle studio** (owner) — full-screen canvas with brush, any-colour picker,
  cute stickers (pandas · beach · sweets), paste-any-image, and Instagram-story
  style drag / resize / rotate
- **Sketchbook** — keep doodles to a browsable archive
- **Stamps** — postage-stamp shaped photo collection
- **Live sync** — visitors see updates in real time (Supabase Realtime)
- **Owner-only editing** — protected by Supabase Auth + Row-Level Security

---

## 🧱 Tech

- Plain HTML + React 18 (via in-browser Babel — **no build step**)
- [Supabase](https://supabase.com) for database, auth, storage & realtime
- Deployed as a static site on [Netlify](https://netlify.com)

Because there's no bundler, the app is just static files — open `index.html`
on any static host and it runs.

---

## 📁 Structure

```
.
├── index.html              # entry point — loads everything
├── colors_and_type.css     # design tokens (colours + fonts)
├── src/
│   ├── app.jsx             # root component + state + data wiring
│   ├── components.jsx      # header, polaroid, buttons, icons…
│   ├── screens.jsx         # feed, hero, lightbox, upload, mood, note
│   ├── paint-board.jsx     # doodle studio + sketchbook
│   ├── sticker-library.jsx # SVG sticker set
│   ├── stamps.jsx          # stamp collection
│   ├── tweaks-panel.jsx    # in-app tweak controls
│   ├── panda-urls.js       # inlined panda sticker images
│   └── supabase-client.js  # all backend calls (window.SB)
└── supabase/
    └── setup.sql           # one-shot database + storage + policies setup
```

---

## 🚀 Setup

### 1. Supabase
1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New query**, paste the contents of
   [`supabase/setup.sql`](supabase/setup.sql), and **Run**.
3. **Authentication → Users → Add user** — create the owner account
   (email + password, with *Auto Confirm* on).
4. Copy your project URL and **publishable** anon key into
   [`src/supabase-client.js`](src/supabase-client.js):
   ```js
   const SUPABASE_URL      = 'https://YOUR-PROJECT.supabase.co';
   const SUPABASE_ANON_KEY = 'YOUR-PUBLISHABLE-KEY';
   const OWNER_EMAIL       = 'you@example.com';
   ```
   > The anon/publishable key is safe to commit — it's a public client key.
   > All write access is enforced server-side by Row-Level Security.

### 2. Run locally
No build needed. Serve the folder with any static server:
```bash
npx serve .
# or
python3 -m http.server
```
Then open the printed URL.

### 3. Deploy (Netlify)
- Connect this repo to Netlify (or drag the folder into the Netlify dashboard).
- No build command needed; publish directory is the repo root.
- `netlify.toml` is already configured.

---

## 🔑 Owner vs visitor

- **Visitors** see everything read-only.
- Click **owner**, sign in, and editing controls appear (add photos, change
  mood/note, open the doodle studio, set the background). **Sign out** returns
  to visitor mode.

---

Made with 💛
