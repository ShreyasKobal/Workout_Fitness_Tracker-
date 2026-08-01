# Workout Progress Tracker

A personal running & walking tracker: Dashboard, Workout History (with Edit/Copy/Delete),
Analytics (with day-by-day comparisons), Personal Records, and Settings — all backed by a
free Upstash Redis database so your data follows you across every device.

This guide assumes **zero prior experience**. Follow it top to bottom.

---

## What you'll end up with

- A live website (e.g. `https://your-app.vercel.app`) you can open from your phone, laptop,
  anywhere.
- Your workout data stored in a free cloud database (Upstash), not stuck in one browser.
- The ability to keep updating the code later by editing files and pushing to GitHub —
  Vercel automatically redeploys.

---

## Part 1 — Create your free database (Upstash)

1. Go to **[upstash.com](https://upstash.com)** and sign up (you can use your GitHub account
   to sign up in one click).
2. Once logged in, click **Create Database**.
3. Give it a name (e.g. `workout-tracker`), pick a region close to you, and leave the other
   settings on their defaults. Click **Create**.
4. On the database's page, find the **REST API** section. You'll see two values:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

   Keep this tab open — you'll copy these in a moment.

---

## Part 2 — Get the code onto your computer

1. Install **Node.js** if you don't have it: go to [nodejs.org](https://nodejs.org), download
   the "LTS" version, and run the installer (Next/Next/Finish — defaults are fine).
2. Unzip the project folder you downloaded from this chat somewhere on your computer
   (e.g. your Desktop).
3. Open a terminal (Mac: Terminal app, Windows: Command Prompt or PowerShell) and navigate
   into the folder:
   ```bash
   cd path/to/workout-tracker
   ```
4. Install the project's dependencies:
   ```bash
   npm install
   ```
   This downloads React, Next.js, the chart library, etc. into a `node_modules` folder
   (this is normal and expected — it won't be uploaded to GitHub).

---

## Part 3 — Connect it to your database locally

1. In the project folder, copy `.env.local.example` to a new file named `.env.local`.
2. Open `.env.local` in any text editor and paste in the two values you copied from Upstash
   in Part 1:
   ```
   UPSTASH_REDIS_REST_URL=https://your-actual-url.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-actual-token
   ```
3. Save the file. `.env.local` is already excluded from GitHub uploads (see `.gitignore`),
   so your secret token stays private.
4. Test it locally:
   ```bash
   npm run dev
   ```
   Open **http://localhost:3000** in your browser. You should see the tracker, pre-loaded
   with your historical workouts. Add or edit a workout, then refresh the page — if the
   change is still there, your database connection works.

---

## Part 4 — Push the code to GitHub

1. Go to **[github.com](https://github.com)**, sign in (or create a free account).
2. Click the **+** icon (top right) → **New repository**. Name it e.g. `workout-tracker`,
   keep it **Private** if you'd like, and click **Create repository**.
3. Back in your terminal, inside the project folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/workout-tracker.git
   git push -u origin main
   ```
   (Replace `YOUR-USERNAME` with your actual GitHub username — GitHub shows you this exact
   command on the empty repository's page too, you can copy it from there instead.)

---

## Part 5 — Deploy on Vercel

1. Go to **[vercel.com](https://vercel.com)** and sign up using your GitHub account (this
   makes the next step one click).
2. Click **Add New... → Project**.
3. Find and select the `workout-tracker` repository you just pushed, click **Import**.
4. Before clicking Deploy, expand **Environment Variables** and add the same two values
   from Upstash:
   - Name: `UPSTASH_REDIS_REST_URL` → Value: (paste your URL)
   - Name: `UPSTASH_REDIS_REST_TOKEN` → Value: (paste your token)
5. Click **Deploy**. Wait ~1 minute.
6. You'll get a live URL like `https://workout-tracker-yourname.vercel.app` — open it on
   your phone, bookmark it, done. It's the same data everywhere, because it all lives in
   your Upstash database, not in any one browser.

---

## Making changes later

Edit files locally → test with `npm run dev` → then:
```bash
git add .
git commit -m "describe what you changed"
git push
```
Vercel automatically redeploys within about a minute of every push. No dashboard clicking
required.

---

## Project structure

```
workout-tracker/
├── app/
│   ├── api/workouts/route.js   ← reads/writes your data to Upstash
│   ├── layout.jsx               ← page shell + global styles
│   ├── page.jsx                 ← renders the tracker
│   └── globals.css
├── components/
│   └── WorkoutTracker.jsx       ← the entire app (dashboard, history, analytics, etc.)
├── package.json
├── tailwind.config.js
├── .env.local.example
└── README.md (this file)
```

## Notes

- Free Upstash tier: 10,000 commands/day — a personal tracker used a handful of times a
  day won't come close to that.
- Free Vercel tier covers this project's traffic comfortably.
- If you ever want to wipe and restart, use **Settings → Reset to seed data** inside the
  app, or delete the key directly from the Upstash dashboard's Data Browser.
