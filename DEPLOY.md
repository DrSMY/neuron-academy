# Deploying Neuron Academy

Zero-dependency Node 22+ app: `node server.js` serves the API and static files on `PORT` (default 4655). State lives in a SQLite file (`platform.db`) created next to `server.js` on first boot, with automatic seed + migrations.

## The constraint that decides everything

The app uses Node's built-in `node:sqlite` writing to a **local file**. That requires a host with a **persistent disk and a long-running process**.

| Host | Works? | Notes |
|------|--------|-------|
| Render / Railway / Fly.io / any VPS | ✅ as-is | Attach a persistent volume, set `PORT`, done. Recommended path. |
| Vercel / Netlify / serverless | ❌ as-is | No persistent filesystem. Requires swapping `db.js` to a hosted DB — [Turso](https://turso.tech) (SQLite-compatible, smallest diff; note its client is async so the synchronous `db.prepare(...).get/all/run` call sites need adapting) or Postgres (Neon/Vercel Postgres, bigger rewrite of queries) — plus converting `server.js`'s `http.createServer` handler into a serverless function entry. |

All database access goes through `db.js` + inline `db.prepare(...)` calls in `server.js`. There is no ORM; queries are plain SQL.

## Before any public deploy (required)

1. **Change the admin credentials.** The seed creates `admin@platform.ai` / `admin123`. Either change it in `seed()` in `db.js` before first boot, or add a password-change flow.
2. **Payments are simulated.** `POST /api/module/:id/purchase` accepts any card-shaped input and grants access. On a public URL, either wire Stripe Checkout (swap the simulated section; put enrollment insert in the webhook) or set all module prices to 0 / invite-only while testing.
3. Serve over HTTPS (any of the hosts above do this) and add `Secure` to the session cookie in `startSession()` in `server.js` once HTTPS-only.
4. Optional: set `ANTHROPIC_API_KEY` to later enable the AI tutor (stub at `POST /api/tutor`).

## Environment

- `PORT` — listen port (hosts set this automatically).
- `ANTHROPIC_API_KEY` — optional, AI tutor stub.

No build step. No `package.json` is strictly needed, but hosts detect Node projects by it — a minimal one with `"start": "node server.js"` and `"engines": { "node": ">=22.5" }` is included.
