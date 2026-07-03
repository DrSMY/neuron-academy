# Neuron Academy — AI Learning Platform

A self-hosted learning platform where anyone can sign up and learn AI module by module, with fine-grained admin control over access and per-user pricing. Zero npm dependencies — Node 22's built-in `node:sqlite`, vanilla JS frontends.

Design: sidebar app shell with ⌘K search bar, welcome dashboard with progress panel, staggered entrance animations, springy micro-interactions, and a custom SVG neuron logo (defined in `ICONS.logo` in both `app.js` and `admin.js`, plus the favicons in the HTML files). Mobile switches to a bottom tab bar at ≤900px.

**Themes:** bright and dark, toggled from the top bar (sun/moon, persisted in `localStorage` as `na-theme`, defaults to the system preference with a pre-paint script in each HTML file to avoid flash). All theming is token-driven in `styles.css` — dark tokens in `:root`, light overrides in `html[data-theme="light"]`. The code playground intentionally stays dark in light mode.

## Run

```bash
node server.js
```

- Learner app: http://localhost:4655
- Admin panel: http://localhost:4655/admin
- Certificate verification (public): http://localhost:4655/verify.html
- Default admin: `admin@platform.ai` / `admin123`

Data lives in `platform.db` next to the server; delete it to reset to seed data. Schema migrations run automatically on startup.

## Catalog structure

Content is organised as **Subjects → Tracks → Modules → Lessons**:
- A **subject** is a top-level area (Artificial Intelligence, Mathematics, Business…).
- A **track** is a sub-division inside a subject; each track is its own ordered learning path.
- **Sequential unlocking is per track** — finishing module 1 of a track unlocks module 2 of that track; other tracks are independent.
- Learners browse via **Explore** (subject cards) → subject page (each track drawn as its own neural path).
- Admin manages the whole tree in **Catalog** (subjects & tracks CRUD; every module is assigned to a track). Subjects/tracks have their own publish toggles; a module is only visible when its module, track and subject are all published.

## Learner features

- Email/password signup (scrypt-hashed, session cookies), simulated checkout with per-user pricing
- **Block-based lessons** — each lesson is a sequence of blocks: rich text, embedded video, and four interactive exercise types that must be solved before the lesson can be completed:
  - *Code playground* — runnable JavaScript in a sandboxed iframe, checked against a goal console output
  - *Put in order* — drag-and-drop (or arrow-button) sequencing
  - *Match pairs* — term ↔ definition matching
  - *Fill in the blanks* — `{{answer|alternate}}` placeholders, case-insensitive
- **Quizzes with question banks** — each attempt draws N random questions with shuffled options; retries get a fresh draw
- **Sequential neural path** — the catalog is a connected path with glowing segments for completed modules; content unlocks module by module (admin can override per user)
- **Home dashboard** — "continue where you left off" hero with radial progress ring and resume deep link, streak flame (topbar too), GitHub-style activity heatmap, XP with levels, badges
- **Celebrations** — SVG checkmark draw on lesson completion, particle burst + score count-up on quiz pass, animated module-unlock card; all respect `prefers-reduced-motion`
- **Spaced-repetition flashcards** — SM-2-style daily review queue (`Review` nav with due count); cards auto-derived from match/blank blocks plus admin-authored ones; +2 XP per card per day
- **PDF certificates** — auto-issued on module completion, downloadable dark-themed PDF (hand-rolled writer in `pdf.js`) with a verification code checkable at `/verify.html`
- **Notes & highlights** — select lesson text to highlight it, write per-lesson notes; highlights re-render as marks
- **Cmd/Ctrl+K palette** — fuzzy search across modules, lessons, and actions
- **Ask the tutor** — collapsed panel in every lesson, currently a stub (see below)

## Admin features (`/admin`)

- Overview dashboard: learners, enrollments, simulated revenue, completions, recent purchases
- Module CRUD: level, duration, base price, pass mark, questions-per-attempt, position, publish toggle
- **Block composer** — build lessons from typed blocks with per-type editors, reorder/delete
- Quiz bank editor and flashcard manager (auto-derived cards flagged, add/delete your own)
- Users & Pricing: per user × module custom price, free access grant, sequential-unlock override, revoke purchase
- **Analytics**: enrollment→started→passed→completed funnel per module, per-lesson drop-off bars, quiz item analysis (% correct + most-picked wrong answer, computed from stored answer maps)

## AI tutor extension point

`POST /api/tutor` in `server.js` is the single place to wire in Claude:
- It reads `ANTHROPIC_API_KEY` from the environment and currently returns a friendly "not configured" reply when absent.
- The lesson view already has the "Ask the tutor" panel wired to this route with a message thread UI.
- To enable: set the env var and replace the `TODO(tutor)` section with a call to the Anthropic API (add lesson context from `lessons.blocks_json`). Nothing else needs to change.

## Swapping in real payments later

Purchases go through `POST /api/module/:id/purchase` in `server.js`. Replace the simulated section with a Stripe Checkout session and move the `INSERT INTO enrollments` into the webhook handler.
