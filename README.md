# Rylee & Bree Invitation

A modern event invitation website built entirely with HTML, CSS, and vanilla JavaScript, hosted on [Vercel](https://vercel.com). Guests view event details and RSVP; each RSVP is stored as its own JSON file in [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) storage via a small serverless function — no external database to manage.

- Site: **https://rylee-bree-invitation.vercel.app**

## Goals

- Fast, elegant, mobile-first invitation page that works on any device.
- Guests can RSVP with their name, phone number, guest count, and an optional message.
- Every submission lands in one place (Vercel Blob) so you can see all responses, not just the ones on each guest's own device.
- You can download all responses as a single JSON file anytime, and re-upload a JSON file to restore/migrate data.
- Single Vercel project, no separate server or database service to maintain.

## Tech Stack

- **HTML5** — semantic markup for the invitation, RSVP form, and thank-you state.
- **CSS3** — modern CSS (custom properties, Grid/Flexbox, `clamp()` for fluid type, no preprocessor).
- **Vanilla JavaScript (ES Modules)** — no framework; `js/rsvp.js` calls the site's own `/api/rsvp` route with `fetch()`.
- **Vercel Serverless Functions** (Node.js, in `/api`) — the only "backend code" in the project:
  - `POST /api/rsvp` — validates a submission and writes it as `rsvps/<uuid>.json` in Blob storage.
  - `GET /api/export?key=...` — reads every RSVP blob and returns them as one downloadable JSON array.
  - `POST /api/import?key=...` — accepts a JSON array and re-uploads each entry as a blob (for restoring a previous export).
- **Vercel Blob** — stores each RSVP as an individual JSON object. Writing one file per submission avoids read-modify-write race conditions when multiple guests submit around the same time.

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
│   ├── rsvp.js              # POST: validate + write one JSON blob per RSVP
│   ├── export.js             # GET: aggregate all RSVP blobs into one downloadable JSON file
│   └── import.js              # POST: re-upload a JSON array of RSVPs as individual blobs
├── /assets
│   ├── images/              # Photos, background art
│   └── fonts/                # Self-hosted fonts (optional)
├── package.json              # Only dependency: @vercel/blob
├── .env.example               # Documents required env values (see below)
├── .gitignore
└── README.md
```

> `ADMIN_EXPORT_KEY` gates `/api/export` and `/api/import` so random visitors can't download or overwrite your guest list — pass it as `?key=...` on those two URLs only. `BLOB_READ_WRITE_TOKEN` is generated automatically by Vercel once Blob storage is enabled on the project; neither value is ever referenced from browser-facing JS.

## Implementation Plan

### Phase 1 — Project Setup
- [x] Initialize repo structure (folders above), `.gitignore`.
- [x] Create a Vercel project linked to this repo (done — https://rylee-bree-invitation.vercel.app).
- [ ] Enable **Vercel Blob** on the project (Vercel dashboard → Storage → Create Database → Blob). This automatically sets `BLOB_READ_WRITE_TOKEN` as an environment variable.
- [ ] Set `ADMIN_EXPORT_KEY` yourself under Project Settings → Environment Variables (any long random string you choose and keep private).

### Phase 2 — RSVP API (Vercel Serverless Functions)
- [x] `api/rsvp.js` — validates input (name, phone format, guest count 0-20) and writes `rsvps/<uuid>.json`.
- [x] `api/export.js` — lists all blobs under `rsvps/`, fetches and aggregates them, returns one JSON array, key-protected.
- [x] `api/import.js` — accepts a JSON array and re-uploads each entry as a blob, key-protected.
- [ ] Deploy and smoke-test all three routes against the real Blob store once it's enabled (Phase 1).

### Phase 3 — Invitation Page (HTML/CSS)
- [x] Build hero section: names, date, time, venue, countdown timer.
- [x] Event details section (when/where/dress code cards; registry/schedule can be added later).
- [ ] Photo gallery / story section (optional).
- [x] Responsive layout using CSS Grid/Flexbox; design tokens via CSS custom properties (colors, spacing, type scale).
- [x] Accessibility: semantic landmarks, sufficient color contrast, focus states, alt text.

### Phase 4 — RSVP Form (Frontend)
- [x] Build RSVP form (name, phone number, guest count, message).
- [x] Client-side validation (required fields, phone format, guest count bounds) mirroring the API's checks.
- [x] In `js/rsvp.js`, `fetch('/api/rsvp', { method: 'POST', body: JSON.stringify(data) })` on form submit.
- [x] Handle loading/disabled state on submit button, show success/error feedback inline.
- [x] Redirect or reveal a "Thank you" confirmation state after successful submit.
- [x] Basic anti-spam measure (honeypot field).

### Phase 5 — Polish
- [x] Add subtle animations/transitions (CSS transitions, `IntersectionObserver` for scroll reveals).
- [x] Add countdown-to-event script in `main.js`.
- [ ] Add favicon, social share meta tags (Open Graph/Twitter card) with event image.
- [ ] Cross-browser and mobile testing (iOS Safari, Android Chrome).
- [ ] Lighthouse pass: performance, accessibility, SEO.

### Phase 6 — Deployment & Data Management
- [x] Push to GitHub `main` branch (this repo) — Vercel auto-deploys on every push.
- [ ] Confirm Blob storage and `ADMIN_EXPORT_KEY` are set in Vercel's dashboard.
- [ ] Verify RSVP submissions land in Blob storage end-to-end on the deployed site.
- [ ] Periodically visit `/api/export?key=...` in a browser to download the current guest list as JSON (this also serves as your backup).

## Environment Variables

Documented in `.env.example`. Both are **server-side only** (used inside `/api` functions) and must never be referenced from `/js` files that ship to the browser:

```
BLOB_READ_WRITE_TOKEN=...   # set automatically by Vercel when Blob storage is enabled
ADMIN_EXPORT_KEY=...        # choose your own long random string; gates /api/export and /api/import
```

## Getting Started (once code exists)

1. Enable Blob storage on the Vercel project (Storage tab → Create Database → Blob) — this sets `BLOB_READ_WRITE_TOKEN` for you.
2. Add `ADMIN_EXPORT_KEY` yourself under Project Settings → Environment Variables.
3. Run locally with `vercel dev` (requires `vercel login` once) so `/api` functions and the static files serve together the same way they will in production.
4. Submit a test RSVP through the form, then visit `/api/export?key=<your key>` to confirm it appears in the exported JSON.
