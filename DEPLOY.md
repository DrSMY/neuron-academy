# Deploying NeuroSeed

Zero-dependency Node 22+ app: `node server.js` serves the API and static files on `PORT` (default 4655). State lives in a SQLite file (`platform.db`) created next to `server.js` on first boot, with automatic seed + migrations.

## The constraint that decides everything

The app uses Node's built-in `node:sqlite` writing to a **local file**. That requires a host with a **persistent disk and a long-running process**.

| Host | Works? | Notes |
|------|--------|-------|
| Render / Railway / Fly.io / any VPS | ✅ as-is | Attach a persistent volume, set `PORT`, done. Recommended path. |
| Vercel / Netlify / serverless | ❌ as-is | No persistent filesystem. Requires swapping `db.js` to a hosted DB — [Turso](https://turso.tech) (SQLite-compatible, smallest diff; note its client is async so the synchronous `db.prepare(...).get/all/run` call sites need adapting) or Postgres (Neon/Vercel Postgres, bigger rewrite of queries) — plus converting `server.js`'s `http.createServer` handler into a serverless function entry. |

All database access goes through `db.js` + inline `db.prepare(...)` calls in `server.js`. There is no ORM; queries are plain SQL.

## Deploying to Render (recommended path)

A `render.yaml` blueprint is included at the repo root — Render reads it automatically and provisions everything in one go: a web service, a 1GB persistent disk mounted at `/data`, and the env vars below.

1. Push this repo to GitHub if you haven't already (it already is, at `DrSMY/neuron-academy`).
2. In the [Render dashboard](https://dashboard.render.com), click **New → Blueprint**, connect your GitHub account, and pick this repo. Render detects `render.yaml` automatically.
3. Render will prompt you to fill in the two `sync: false` secrets before first deploy — set `ADMIN_EMAIL` and `ADMIN_PASSWORD` to your own values here (not the seeded `admin@platform.ai` / `admin123` defaults). These only take effect on the *first* boot, when the database is empty and `seed()` runs.
4. Click **Apply**. First deploy takes a few minutes (`npm install` + boot). Render gives you a `https://neuroseed-xxxx.onrender.com` URL — visit it, sign in as your admin, and check the Overview dashboard loads.
5. **Cost note:** the blueprint uses Render's `starter` plan (~$7/mo) because persistent disks aren't available on the free tier — and persistence is the entire reason to pick Render over Vercel here. If you deploy on the free tier instead, the disk won't attach and `platform.db` will reset on every redeploy/restart, defeating the purpose.
6. Custom domain: add it under the service's **Settings → Custom Domains** once you're happy with the `.onrender.com` URL.

No GitHub Actions or CI config needed — Render redeploys automatically on every push to `main` (`autoDeploy: true` in the blueprint).

## Before any public deploy (required)

1. **Admin credentials** — handled above via `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars (falls back to the insecure `admin@platform.ai` / `admin123` seed defaults if unset — never leave those on a public URL).
2. **Payments are simulated.** `POST /api/module/:id/purchase` accepts any card-shaped input and grants access. On a public URL, either wire Stripe Checkout (swap the simulated section; put enrollment insert in the webhook) or set all module prices to 0 / invite-only while testing.
3. Serve over HTTPS (Render does this automatically) and add `Secure` to the session cookie in `startSession()` in `server.js` once HTTPS-only.
4. Optional: set `ANTHROPIC_API_KEY` to later enable the AI tutor (stub at `POST /api/tutor`).

## Environment

- `PORT` — listen port (hosts set this automatically).
- `DB_PATH` — full path to the SQLite file. Defaults to `platform.db` next to `server.js`; set this to a path on a mounted persistent disk in production (the Render blueprint sets `/data/platform.db`).
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — override the seeded admin account. Only read once, on first boot when the `users` table is empty.
- `ANTHROPIC_API_KEY` — optional, AI tutor stub.

No build step. No `package.json` is strictly needed, but hosts detect Node projects by it — a minimal one with `"start": "node server.js"` and `"engines": { "node": ">=22.5" }` is included.
