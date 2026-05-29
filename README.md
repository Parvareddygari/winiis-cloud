# w.inii's cloud ☁️

A full-stack keepsake web app — a soft little corner of the internet for photos,
moods, daily notes, doodles, and postage-stamp memories. Anyone can browse;
a single authenticated owner signs in to add and edit everything **live**.

Built solo as a learning project to wire a real database, authentication,
file storage, and realtime sync into a no-build React front end.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%7C%20Auth%20%7C%20Storage%20%7C%20Realtime-3ECF8E?logo=supabase&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify-deployed-00C7B7?logo=netlify&logoColor=white)
![No build step](https://img.shields.io/badge/build-none%20(static)-FAB005)

---

## ✨ Features

- **Memory feed** — polaroid photos with caption, date, and location
- **Mood** — pick today's mood; shows when it was last updated
- **Daily note** — a short message with a last-updated timestamp
- **Doodle studio** (owner) — full-screen canvas with brush, any-colour picker,
  cute stickers (pandas · beach · sweets), paste-any-image, and Instagram-story
  style drag / resize / rotate
- **Sketchbook** — saved doodles in a browsable archive
- **Stamps** — a postage-stamp-shaped photo collection
- **Live sync** — visitors see updates in real time (Supabase Realtime)
- **Owner-only editing** — protected by Supabase Auth + Row-Level Security

---

## 🛠️ What this project demonstrates

- **React 18** component architecture with no bundler — JSX transpiled in the
  browser via Babel, so the whole app ships as static files
- **Postgres database** modelled and provisioned from a single SQL script
- **Authentication** — email/password sign-in with a single owner account
- **Row-Level Security** — reads are public, writes are locked to the owner,
  enforced server-side (not in the UI)
- **File storage** — photo + doodle uploads to Supabase Storage with public
  read URLs
- **Realtime subscriptions** — the public feed updates the instant the owner
  changes something
- **Static deployment** — continuous deploy on Netlify with SPA-style routing

---

## 💭 Why I built this & what I learned

I made this because I love building things — turning an idea in my head into
something real on a screen is the part of coding that makes me happy. This
started as a small personal site and grew as I kept asking "okay, but can I
also make it do _this_?"

A few things I figured out along the way:

- **Connecting a real backend was the big leap.** Before this, my projects only
  lived in the browser. Learning to store photos, notes, and doodles in a real
  database — and have them stay there — felt like a different level.
- **Security isn't just hiding a button.** My first instinct was to hide the
  editing controls from visitors. Then I learned that anyone could still get
  around that, and that real protection has to live on the server. Setting up
  Row-Level Security so only the owner can change anything was the hardest and
  most satisfying part.
- **Realtime is magic.** Getting the page to update on its own the moment
  something changes still makes me smile.
- **Shipping it for real.** Putting it online so it's an actual link, not just
  a file on my laptop, made it feel finished.

I'm still early in my journey and there's plenty I'd do differently next time —
but I'm proud of this one, and I had a lot of fun making it.

---

## 🧱 Tech

- Plain HTML + **React 18** (via in-browser Babel — **no build step**)
- [**Supabase**](https://supabase.com) — Postgres database, auth, storage & realtime
- Deployed as a static site on [**Netlify**](https://netlify.com)

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

## 📸 Screenshots

The public view — memory feed, mood, daily note, doodle, and stamp collection:

![App overview](screenshots/app-overview.png)

The doodle studio — a full canvas with brush, stickers, and paste-any-image:

![Doodle studio](screenshots/doodle-studio.png)

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

## 📝 Before you publish

`src/supabase-client.js` ships with real config values filled in. The
anon/publishable key is meant to be public, but you may want to swap the
`OWNER_EMAIL` for a dedicated address rather than a personal one before making
the repo public. Your data stays protected by Row-Level Security either way.

---

Made with 💛
