# Rylee & Bree Invitation

A modern event invitation website with a plain HTML/CSS/JS static frontend. Guests view event details, RSVP, and submit their information, which is stored in a Postgres database — both the API and the database live on [Render](https://render.com); the static frontend is hosted on [Vercel](https://vercel.com).

- Frontend: **https://rylee-bree-invitation.vercel.app**
- API: **https://rylee-bree-invitation.onrender.com**

## Goals

- Fast, elegant, mobile-first invitation page that works on any device.
- Guests can RSVP (attending / not attending), specify guest count, meal preference, and leave a message.
- All submissions persist to a Postgres database via a small API — the browser never talks to Postgres directly.
- Clean split: Vercel serves only static files; Render runs the API and the database next to each other on Render's private network.

## Tech Stack

- **HTML5** — semantic markup, single `index.html` (or a few static pages: home, RSVP, thank-you).
- **CSS3** — modern CSS (custom properties, Grid/Flexbox, `clamp()` for fluid type, no preprocessor).
- **Vanilla JavaScript (ES Modules)** — no framework; the frontend only calls `fetch()` against the Render API, never the database directly.
- **Render Web Service** (Node.js/Express) — a small API (`server.js` + routes) that validates input and runs SQL against Postgres using the `pg` client. This is the only "backend code" in the project — everything user-facing stays plain HTML/CSS/JS.
- **Render Postgres** — managed Postgres database holding the `rsvps` table. Reachable from the Render Web Service over Render's private network (fast, no public exposure needed between the two).
- **Vercel** — hosts only the static site (`index.html`, `css/`, `js/`, `assets/`). No serverless functions needed since Render owns the API.

## Project Structure

```
/
├── index.html              # Landing / invitation page
├── rsvp.html               # RSVP form page (or a section on index.html)
├── thank-you.html          # Confirmation page after RSVP submit
├── /css
│   └── styles.css          # Global styles, design tokens (custom properties)
├── /js
│   ├── rsvp.js             # Form handling, validation, fetch(RENDER_API_URL + '/rsvp')
│   ├── config.js           # Exposes the Render API base URL to the frontend (not a secret)
│   └── main.js             # Shared UI behavior (nav, animations, countdown)
├── /assets
│   ├── images/              # Photos, background art
│   └── fonts/                # Self-hosted fonts (optional)
├── /server                   # Render Web Service (Node/Express API)
│   ├── server.js              # Express app entrypoint, CORS config, routes
│   ├── db.js                  # pg Pool using process.env.DATABASE_URL
│   ├── routes/
│   │   └── rsvp.js             # POST /rsvp handler: validate + insert
│   └── package.json            # Server-only dependencies (express, pg, cors)
├── /db
│   └── schema.sql            # SQL to create the rsvps table on Render Postgres
├── .env.example               # Documents required env values (see below)
├── .gitignore
└── README.md
```

> `index.html`/`css`/`js`/`assets` deploy to **Vercel** as a static site. `/server` and `/db` are only relevant to the **Render Web Service** — Vercel ignores them (or a `vercel.json` can explicitly exclude `/server` from the static build if needed).

> The Render Postgres connection string is a secret. It lives only in the Render Web Service's environment variables (used inside `server/db.js`) and is never sent to or read by browser JS. The Render API's public URL, by contrast, is *not* secret — it's referenced directly from `js/config.js` so the frontend knows where to `fetch()`.

## Implementation Plan

### Phase 1 — Project Setup
- [x] Initialize repo structure (folders above), `.gitignore` (include `.env`, `node_modules/`).
- [x] Create a Render Web Service (done — https://rylee-bree-invitation.onrender.com) and a Render Postgres instance; note the internal connection string.
- [x] Create a Vercel project linked to this repo for the static frontend (done — https://rylee-bree-invitation.vercel.app).
- [ ] Configure Vercel's "Root Directory" / build settings so it only serves the static files, not `/server`.
- [x] Configure Render's Web Service build/start commands to run from `/server` (Root Directory `server`, Start Command `node server.js`).

### Phase 2 — Database Schema (Render Postgres)
- [x] Write `db/schema.sql` to create the `rsvps` table:
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
- [ ] Run `schema.sql` against the Render database (via Render's dashboard shell or a local `psql` connection using the external connection string).
- [ ] All access control happens in the API layer (Phase 4) — the database itself trusts whoever holds the connection string, which only the Render Web Service has.

### Phase 3 — Invitation Page (HTML/CSS)
- [ ] Build hero section: names, date, time, venue, countdown timer.
- [ ] Event details section (schedule, location with embedded map link, dress code, registry link if needed).
- [ ] Photo gallery / story section (optional).
- [ ] Responsive layout using CSS Grid/Flexbox; design tokens via CSS custom properties (colors, spacing, type scale).
- [ ] Accessibility: semantic landmarks, sufficient color contrast, focus states, alt text.

### Phase 4 — RSVP Form & API Integration
- [ ] Build RSVP form (name, email, attending yes/no, guest count, meal preference, message).
- [ ] Client-side validation (required fields, email format, guest count bounds).
- [x] Write `server/server.js` (Express app) + `server/routes/rsvp.js`: `POST /rsvp` re-validates input server-side, inserts a row via `pg` using `DATABASE_URL`, returns JSON success/error. CORS restricted via `CORS_ORIGIN` env var.
- [ ] In `js/rsvp.js`, `fetch(`${RENDER_API_URL}/rsvp`, { method: 'POST', body: JSON.stringify(data) })` on form submit, using the base URL from `js/config.js`.
- [ ] Handle loading/disabled state on submit button, show success/error feedback inline.
- [ ] Redirect or reveal a "Thank you" confirmation state after successful submit.
- [ ] Basic anti-spam measure (honeypot field and/or simple rate limiting middleware in Express, optional).

### Phase 5 — Polish
- [ ] Add subtle animations/transitions (CSS transitions, `IntersectionObserver` for scroll reveals).
- [ ] Add countdown-to-event script in `main.js`.
- [ ] Add favicon, social share meta tags (Open Graph/Twitter card) with event image.
- [ ] Cross-browser and mobile testing (iOS Safari, Android Chrome).
- [ ] Lighthouse pass: performance, accessibility, SEO.

### Phase 6 — Deployment
- [x] Push to GitHub `main` branch (this repo).
- [x] Vercel project connected — deploys static frontend on every push to `main`.
- [x] Render Web Service connected — deploys `/server` API on every push to `main`.
- [ ] Set `DATABASE_URL` (Render Postgres internal connection string) as a Render environment variable on the Web Service — never commit it, never expose it to the browser.
- [ ] Set the Render API's public URL in `js/config.js` (or as a Vercel environment variable injected at build time) so the frontend knows where to send requests.
- [ ] Confirm CORS on the Render API allows requests from the Vercel domain.
- [ ] Verify RSVP submissions land in the Render `rsvps` table end-to-end on the deployed site.

### Phase 7 (Optional) — Admin View
- [ ] Simple password-protected route on the Render API (e.g. `GET /admin/rsvps` behind basic auth) listing all RSVPs, counts, and export-to-CSV button.

## Environment Variables

Documented in `.env.example` for reference. `DATABASE_URL` is **server-side only** (used inside `server/db.js` on Render) and must never be referenced from `/js` files that ship to the browser:

```
DATABASE_URL=postgres://user:password@host:port/dbname   # Render Postgres internal connection string
PORT=10000                                                 # Render sets this automatically
CORS_ORIGIN=https://rylee-bree-invitation.vercel.app       # Restrict API access to the frontend's domain
```

## Getting Started (once code exists)

1. Render Postgres and Web Service already exist (see links above). Run `db/schema.sql` against the database to create the `rsvps` table.
2. In the Render Web Service settings, set Root Directory to `server`, Start Command to `node server.js`, and add the `DATABASE_URL` / `CORS_ORIGIN` environment variables.
3. In the Vercel project settings, confirm the Root Directory is the repo root (or wherever the static files live) so `/server` and `/db` aren't included in the static build.
4. Run the API locally with `cd server && npm install && node server.js`, and open `index.html` with any static server (e.g. `npx serve`) pointing `js/config.js` at `http://localhost:<port>`.
5. Submit a test RSVP and confirm the row appears in the `rsvps` table (via Render's dashboard or `psql`).
