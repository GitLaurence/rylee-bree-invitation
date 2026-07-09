# Rylee & Bree Invitation

A modern, single-page event invitation website built with plain HTML, CSS, and JavaScript (no frontend framework). Guests view event details, RSVP, and submit their information, which is stored in a Postgres database hosted on [Render](https://render.com), accessed through a thin serverless API layer deployed on [Vercel](https://vercel.com).

## Goals

- Fast, elegant, mobile-first invitation page that works on any device.
- Guests can RSVP (attending / not attending), specify guest count, meal preference, and leave a message.
- All submissions persist to a Render-hosted Postgres database via a small API — the browser never talks to Postgres directly.
- Single Vercel project serves both the static site and the API (Vercel Serverless Functions), so there's one deploy target for the frontend.

## Tech Stack

- **HTML5** — semantic markup, single `index.html` (or a few static pages: home, RSVP, thank-you).
- **CSS3** — modern CSS (custom properties, Grid/Flexbox, `clamp()` for fluid type, no preprocessor).
- **Vanilla JavaScript (ES Modules)** — no framework; the frontend only calls `fetch()` against our own API routes, never the database directly.
- **Vercel Serverless Functions** (Node.js) — a minimal API (e.g. `api/rsvp.js`) that validates input and runs SQL against Postgres using the `pg` client. This is the only "backend code" in the project — everything user-facing stays plain HTML/CSS/JS.
- **Render Postgres** — managed Postgres database holding the `rsvps` table. Reachable only from the Vercel functions via its connection string (kept as a Vercel environment variable, never exposed to the browser).

## Project Structure

```
/
├── index.html              # Landing / invitation page
├── rsvp.html               # RSVP form page (or a section on index.html)
├── thank-you.html          # Confirmation page after RSVP submit
├── /css
│   └── styles.css          # Global styles, design tokens (custom properties)
├── /js
│   ├── rsvp.js             # Form handling, validation, fetch('/api/rsvp')
│   └── main.js             # Shared UI behavior (nav, animations, countdown)
├── /api
│   └── rsvp.js             # Vercel Serverless Function: validates + inserts into Render Postgres
├── /assets
│   ├── images/              # Photos, background art
│   └── fonts/                # Self-hosted fonts (optional)
├── /db
│   └── schema.sql            # SQL to create the rsvps table on Render Postgres
├── package.json              # Only needed for the /api function's dependencies (e.g. `pg`)
├── vercel.json                # (Optional) routing/config for static + functions
├── .env.example               # Documents required env values (see below)
├── .gitignore
└── README.md
```

> The Render Postgres connection string is a secret. It lives only in Vercel's environment variables (used inside `/api/rsvp.js` at runtime) and is never sent to or read by browser JS.

## Implementation Plan

### Phase 1 — Project Setup
- [ ] Initialize repo structure (folders above), `.gitignore` (include `.env`, `node_modules/`).
- [ ] Create a Render Postgres instance; note the internal/external connection string.
- [ ] Create a Vercel project linked to this repo (static site + `/api` functions deploy together).
- [ ] Add minimal `package.json` with `pg` as a dependency for the API function.

### Phase 2 — Database Schema (Render Postgres)
- [ ] Write `db/schema.sql` to create the `rsvps` table:
  | Column | Type | Notes |
  |---|---|---|
  | `id` | `uuid` default `gen_random_uuid()` | primary key |
  | `created_at` | `timestamptz` default `now()` | submission time |
  | `full_name` | `text` | required |
  | `email` | `text` | required, basic format validation client-side |
  | `attending` | `boolean` | yes/no |
  | `guest_count` | `int2` default 0 | additional guests |
  | `meal_preference` | `text` | nullable, e.g. "chicken/vegetarian/none" |
  | `message` | `text` | nullable, well-wishes note |
- [ ] Run `schema.sql` against the Render database (via Render's psql/shell or a local `psql` connection using the external connection string).
- [ ] Since there's no Supabase-style RLS, all access control happens in the API layer (Phase 4) — the database itself trusts whoever holds the connection string.

### Phase 3 — Invitation Page (HTML/CSS)
- [ ] Build hero section: names, date, time, venue, countdown timer.
- [ ] Event details section (schedule, location with embedded map link, dress code, registry link if needed).
- [ ] Photo gallery / story section (optional).
- [ ] Responsive layout using CSS Grid/Flexbox; design tokens via CSS custom properties (colors, spacing, type scale).
- [ ] Accessibility: semantic landmarks, sufficient color contrast, focus states, alt text.

### Phase 4 — RSVP Form & API Integration
- [ ] Build RSVP form (name, email, attending yes/no, guest count, meal preference, message).
- [ ] Client-side validation (required fields, email format, guest count bounds).
- [ ] Write `api/rsvp.js` (Vercel Serverless Function): accepts `POST`, re-validates input server-side, inserts a row via `pg` using the Render connection string from `process.env.DATABASE_URL`, returns JSON success/error.
- [ ] In `js/rsvp.js`, `fetch('/api/rsvp', { method: 'POST', body: JSON.stringify(data) })` on form submit.
- [ ] Handle loading/disabled state on submit button, show success/error feedback inline.
- [ ] Redirect or reveal a "Thank you" confirmation state after successful submit.
- [ ] Basic anti-spam measure (honeypot field and/or simple rate limiting inside `api/rsvp.js`, optional).

### Phase 5 — Polish
- [ ] Add subtle animations/transitions (CSS transitions, `IntersectionObserver` for scroll reveals).
- [ ] Add countdown-to-event script in `main.js`.
- [ ] Add favicon, social share meta tags (Open Graph/Twitter card) with event image.
- [ ] Cross-browser and mobile testing (iOS Safari, Android Chrome).
- [ ] Lighthouse pass: performance, accessibility, SEO.

### Phase 6 — Deployment
- [ ] Push to GitHub `main` branch (this repo).
- [ ] Connect the repo to Vercel; it deploys `index.html`/static assets and `/api/rsvp.js` together on every push to `main`.
- [ ] Set `DATABASE_URL` (Render Postgres connection string) as a Vercel environment variable — never commit it, never reference it in client-side JS.
- [ ] Confirm Render's database allows external connections from Vercel (Render Postgres exposes an external connection string by default; no extra network config needed for typical setups).
- [ ] Verify RSVP submissions land in the Render `rsvps` table end-to-end on the deployed site.

### Phase 7 (Optional) — Admin View
- [ ] Simple password-protected page (checked in another small API function) listing all RSVPs, counts, and export-to-CSV button.

## Environment Variables

Documented in `.env.example` for reference. These are **server-side only** (used inside `api/rsvp.js` on Vercel) and must never be referenced from `/js` files that ship to the browser:

```
DATABASE_URL=postgres://user:password@host:port/dbname   # Render Postgres connection string
```

## Getting Started (once code exists)

1. Create a Render Postgres instance and run `db/schema.sql` against it to create the `rsvps` table.
2. Create a Vercel project from this repo; add `DATABASE_URL` under Project Settings → Environment Variables (use the Render connection string).
3. Run locally with the Vercel CLI (`vercel dev`) so `/api/rsvp.js` and the static files serve together the same way they will in production.
4. Submit a test RSVP and confirm the row appears in the `rsvps` table (via Render's dashboard or `psql`).
