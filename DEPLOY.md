# Deploying NeuroSeed

Zero-dependency Node 22+ app: `node server.js` serves the API and static files on `PORT` (default 4655). State lives in a SQLite file (`platform.db`) created next to `server.js` on first boot, with automatic seed + migrations.

## The constraint that decides everything

The app uses Node's built-in `node:sqlite` writing to a **local file**. That requires a host with a **persistent disk and a long-running process**.

| Host | Works? | Notes |
|------|--------|-------|
| Render / Railway / Fly.io / any VPS | ✅ as-is | Attach a persistent volume, set `PORT`, done. Recommended if you need data to actually persist. |
| Vercel | ⚠️ runs, but data resets | `server.js` is adapted to also export a plain request-handler function (see below) and `vercel.json` routes everything to it. The DB writes to `/tmp`, which Vercel wipes on cold starts — fine for a demo/sandbox where losing sample data doesn't matter, not fine for real user accounts. See "Deploying to Vercel" below. |
| Netlify / other serverless | ❌ as-is | Same constraint as Vercel, without the adaptation done here. Would need the same treatment (or a real hosted DB) to work at all. |

All database access goes through `db.js` + inline `db.prepare(...)` calls in `server.js`. There is no ORM; queries are plain SQL.

## Deploying to Vercel (data resets on cold start — accepted tradeoff)

`server.js` runs as a normal Node server locally/on Render, and *also* exports its request handler as a plain `(req, res) => {}` function so Vercel's `@vercel/node` runtime can call it as a serverless function — `vercel.json` routes every path to it, so all the existing routing/static-file logic in `server.js` runs unchanged.

1. Go to [vercel.com/new](https://vercel.com/new), connect GitHub, import `DrSMY/neuron-academy`.
2. Vercel auto-detects `vercel.json` — no framework preset needed, leave build/output settings blank.
3. Optionally set `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars (Project Settings → Environment Variables) so the seeded admin isn't the public demo login. Without them you get `admin@platform.ai` / `admin123`.
4. Deploy. Vercel gives you a `https://<project>.vercel.app` URL.
5. **What "data resets" means in practice:** the DB lives at `/tmp/platform.db`, which only survives for the life of one warm serverless instance. A new cold start (which happens often — after idle periods, on scale-out, on every redeploy) gets a *fresh empty database* that reseeds the 3 demo modules and the default admin/teacher accounts. Any signups, purchases, or progress made against a previous instance are gone. This is the tradeoff explicitly accepted for this deploy — don't point real users or paying customers at this URL.
6. **The one real technical risk:** `node:sqlite` is an experimental Node core module requiring Node ≥22.5. `package.json` pins `engines.node` to `22.x`, but Vercel controls exactly which 22.x patch build actually runs. If the deploy logs show an error like `Cannot find module 'node:sqlite'` or similar, that means Vercel's Node 22 build predates 22.5 — the only fix at that point is migrating off `node:sqlite` to a real hosted DB (see the Render section below for what that involves), there's no config workaround.

## Deploying to Render (alternative — real persistence)

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

No build step. No `package.json` is strictly needed, but hosts detect Node projects by it — a minimal one with `"start": "node server.js"` and `"engines": { "node": "22.x" }` is included.
