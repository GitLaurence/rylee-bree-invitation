# Rylee & Bree Invitation

A modern, single-page event invitation website built with plain HTML, CSS, and JavaScript (no frameworks, no build step required). Guests view event details, RSVP, and submit their information, which is stored in [Supabase](https://supabase.com).

## Goals

- Fast, elegant, mobile-first invitation page that works on any device.
- Guests can RSVP (attending / not attending), specify guest count, meal preference, and leave a message.
- All submissions persist to a Supabase Postgres table via the Supabase JS client (no custom backend).
- Simple enough to host as static files (GitHub Pages, Netlify, Vercel, or any static host).

## Tech Stack

- **HTML5** — semantic markup, single `index.html` (or a few static pages: home, RSVP, thank-you).
- **CSS3** — modern CSS (custom properties, Grid/Flexbox, `clamp()` for fluid type, no preprocessor).
- **Vanilla JavaScript (ES Modules)** — no framework; `type="module"` scripts calling the Supabase JS SDK via CDN or npm+bundler-free ESM import.
- **Supabase** — Postgres database, Row Level Security (RLS), and auto-generated REST API for storing RSVPs. Optional: Supabase Auth if an admin dashboard is added later.

## Project Structure

```
/
├── index.html              # Landing / invitation page
├── rsvp.html               # RSVP form page (or a section on index.html)
├── thank-you.html          # Confirmation page after RSVP submit
├── /css
│   └── styles.css          # Global styles, design tokens (custom properties)
├── /js
│   ├── supabaseClient.js   # Initializes Supabase client (URL + anon key)
│   ├── rsvp.js             # Form handling, validation, submit to Supabase
│   └── main.js             # Shared UI behavior (nav, animations, countdown)
├── /assets
│   ├── images/              # Photos, background art
│   └── fonts/                # Self-hosted fonts (optional)
├── .env.example             # Documents required env values (see below)
├── .gitignore
└── README.md
```

> Since this is a static site, the Supabase URL and anon/public key are safe to expose client-side (RLS policies protect the data, not secrecy of the anon key).

## Implementation Plan

### Phase 1 — Project Setup
- [ ] Initialize repo structure (folders above), `.gitignore`.
- [ ] Create Supabase project; note project URL and anon public key.
- [ ] Add `js/supabaseClient.js` that imports `@supabase/supabase-js` via ESM CDN (e.g. `esm.sh` or `jsdelivr`) and initializes the client.

### Phase 2 — Database Schema (Supabase)
- [ ] Create `rsvps` table:
  | Column | Type | Notes |
  |---|---|---|
  | `id` | `uuid` (default `gen_random_uuid()`) | primary key |
  | `created_at` | `timestamptz` default `now()` | submission time |
  | `full_name` | `text` | required |
  | `email` | `text` | required, basic format validation client-side |
  | `attending` | `boolean` | yes/no |
  | `guest_count` | `int2` | default 0, additional guests |
  | `meal_preference` | `text` | nullable, e.g. "chicken/vegetarian/none" |
  | `message` | `text` | nullable, well-wishes note |
- [ ] Enable Row Level Security on the table.
- [ ] Add an `insert`-only RLS policy for the `anon` role (public can submit RSVPs but cannot read/update/delete others' rows).
- [ ] (Optional) Add a policy allowing the couple/admin (authenticated user) to `select` all rows for a private summary view.

### Phase 3 — Invitation Page (HTML/CSS)
- [ ] Build hero section: names, date, time, venue, countdown timer.
- [ ] Event details section (schedule, location with embedded map link, dress code, registry link if needed).
- [ ] Photo gallery / story section (optional).
- [ ] Responsive layout using CSS Grid/Flexbox; design tokens via CSS custom properties (colors, spacing, type scale).
- [ ] Accessibility: semantic landmarks, sufficient color contrast, focus states, alt text.

### Phase 4 — RSVP Form & Supabase Integration
- [ ] Build RSVP form (name, email, attending yes/no, guest count, meal preference, message).
- [ ] Client-side validation (required fields, email format, guest count bounds).
- [ ] On submit, call `supabase.from('rsvps').insert([...])` from `rsvp.js`.
- [ ] Handle loading/disabled state on submit button, show success/error feedback inline.
- [ ] Redirect or reveal a "Thank you" confirmation state after successful submit.
- [ ] Basic anti-spam measure (honeypot field and/or simple rate limiting via Supabase Edge Function, optional).

### Phase 5 — Polish
- [ ] Add subtle animations/transitions (CSS transitions, `IntersectionObserver` for scroll reveals).
- [ ] Add countdown-to-event script in `main.js`.
- [ ] Add favicon, social share meta tags (Open Graph/Twitter card) with event image.
- [ ] Cross-browser and mobile testing (iOS Safari, Android Chrome).
- [ ] Lighthouse pass: performance, accessibility, SEO.

### Phase 6 — Deployment
- [ ] Push to GitHub `main` branch (this repo).
- [ ] Deploy static site via GitHub Pages, Netlify, or Vercel.
- [ ] Set Supabase URL/anon key as build-time or static config values (documented in `.env.example`, injected into `js/supabaseClient.js` or a small `config.js` not committed with secrets if they ever become sensitive).
- [ ] Verify RSVP submissions land in Supabase table end-to-end on the deployed site.

### Phase 7 (Optional) — Admin View
- [ ] Simple password-protected or Supabase-Auth-gated page listing all RSVPs, counts, and export-to-CSV button.

## Environment Variables

Documented in `.env.example` for reference (values are embedded directly in client JS since this is a static site with RLS-protected inserts):

```
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-public-key
```

## Getting Started (once code exists)

1. Create a Supabase project and run the SQL for the `rsvps` table + RLS policies (see Phase 2).
2. Copy your Supabase URL and anon key into `js/supabaseClient.js`.
3. Open `index.html` directly in a browser, or serve locally with any static server (e.g. `npx serve` or the VS Code Live Server extension).
4. Submit a test RSVP and confirm the row appears in the Supabase Table Editor.
