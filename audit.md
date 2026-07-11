# Bug Fix Audit

Chronological list of bugs found and fixed in this repo (design/feature changes excluded — see `git log` for those).

> Re-audited 2026-07-11 against the current code (not just git history). No new commits since the last pass, but a fresh read of `js/admin.js`, `js/main.js`, and the calendar-link markup turned up 3 issues that are still present — see [Newly Identified](#newly-identified-not-yet-fixed) below.

## 1. Vercel Blob export reading from the wrong access mode
- **Commit:** [`1e345c3`](https://github.com/GitLaurence/rylee-bree-invitation/commit/1e345c3) — 2026-07-09
- **Symptom:** `GET /api/export` failed to read RSVP entries back out of Blob storage.
- **Root cause:** The store was created in `private` access mode, but `api/export.js` tried to read each blob via a plain `fetch(blob.url)`, which only works for `public` blobs.
- **Fix:** Switched to `@vercel/blob`'s `get(pathname, { access: 'private' })` and streamed/parsed the result instead of fetching the public URL directly.

## 2. RSVP form stayed visible after a successful submit
- **Commit:** [`4f4f3ee`](https://github.com/GitLaurence/rylee-bree-invitation/commit/4f4f3ee) — 2026-07-09
- **Symptom:** After a guest submitted the RSVP form, the form didn't disappear and the "thank you" message didn't reliably take its place.
- **Root cause:** CSS specificity — the rule hiding the form didn't account for the `[hidden]` attribute correctly, so `form.hidden = true` in JS had no visible effect.
- **Fix:** Added an explicit `.rsvp-form[hidden] { display: none; }` rule, plus a `--submitting` state (dimmed, non-interactive) and a fade-in animation for the thank-you panel so the transition reads correctly.

## 3. Admin RSVP table caused horizontal scrolling on mobile
- **Commit:** [`f14f18d`](https://github.com/GitLaurence/rylee-bree-invitation/commit/f14f18d) — 2026-07-09
- **Symptom:** On narrow viewports, the admin table forced the whole page to scroll sideways instead of wrapping/stacking.
- **Root cause:** A blanket `white-space: nowrap` on table cells plus a fixed-width table forced overflow on small screens.
- **Fix:** Rows collapse into stacked label/value cards below 640px (via `data-label` attributes, header row visually hidden but kept for screen readers); on desktop the blanket `nowrap` was dropped so all six columns fit without overflow.

## 4. Admin secondary button hover state was invisible
- **Commit:** [`d2decea`](https://github.com/GitLaurence/rylee-bree-invitation/commit/d2decea) — 2026-07-11
- **Symptom:** Hovering the secondary button on the admin page produced no visible feedback.
- **Root cause:** `.button--secondary:hover` set `background: var(--color-bg)` — the same color as the page background it already sat on, so the hover state was indistinguishable from the resting state.
- **Fix:** Hover background changed to `var(--color-accent-soft)` with `var(--color-accent-dark)` text so the state change is visible.

## 5. Ambient petal animation was running but effectively invisible
- **Commit:** [`44f125b`](https://github.com/GitLaurence/rylee-bree-invitation/commit/44f125b) — 2026-07-11
- **Symptom:** User-reported: "i dont see the petal animation in the page."
- **Root cause:** Confirmed via headless-browser inspection that the animation *was* running (correct DOM nodes, `animation-name: drift`, no console errors) — the petals were just too small (8–17px) and too low-opacity (0.35–0.38 alpha, similar hue to the background) to be noticeable against the pale blush page background.
- **Fix:** Increased petal size (to 14–29px), raised background alpha to 0.55 and peak keyframe opacity to 0.9, and added a subtle drop shadow for contrast.

## 6. Petals were scoped to the hero only, clipped by `overflow: hidden`
- **Commit:** [`cddf0e5`](https://github.com/GitLaurence/rylee-bree-invitation/commit/cddf0e5) — 2026-07-11
- **Symptom:** Petal container lived inside `.hero`, which has `overflow: hidden` (used to clip decorative glow blobs) — petals could be cut off before their fade-out finished, and didn't match the ambient full-page effect intended by the reference design.
- **Root cause:** `.petals` was a child of `.hero` rather than the page root, so it inherited the hero's clipping box instead of spanning the document.
- **Fix:** Moved `#petals` to be the first child of `<body>`; gave `body` `position: relative`, and promoted `main`/`.footer` to `position: relative` so page content still paints above the petal layer in the stacking order.

## Newly Identified (Not Yet Fixed)

## 7. Countdown timer ignores the event's timezone
- **File:** [`index.html`](index.html) (`data-event-datetime="2026-09-06T10:00:00"`) / [`js/main.js`](js/main.js) `startCountdown()`
- **Symptom:** A guest viewing the site from outside the Philippines sees a countdown that's off by however many hours their timezone differs from Asia/Manila (PHT, UTC+8).
- **Root cause:** `new Date("2026-09-06T10:00:00")` — an ISO string with no `Z`/offset — is parsed as **local time in the visitor's browser**, not Manila time. The Google Calendar links elsewhere on the page correctly pin `ctz=Asia/Manila`, but the countdown's `data-event-datetime` doesn't carry an offset at all.
- **Suggested fix:** Add the explicit offset: `data-event-datetime="2026-09-06T10:00:00+08:00"`.

## 8. "Add to Calendar" location doesn't match the ceremony venue
- **File:** [`index.html`](index.html) — both `.button--ghost` "Add to Calendar" links (hero and thank-you panel)
- **Symptom:** The calendar event is set for 10:00 AM–3:00 PM (spanning both ceremony and reception) but its `location` param is only "Jollibee, Balanga Center Plaza Mall" — the reception venue. A guest tapping the calendar entry to navigate to the 10 AM start would be routed to the wrong address; the ceremony is at Cathedral Shrine and Parish of St. Joseph (added in `d2decea`).
- **Root cause:** The calendar links were authored before the ceremony venue existed as a distinct field on the page, and were never revisited when it was added.
- **Suggested fix:** Either split into two calendar entries (ceremony 10 AM at the Cathedral, reception 1 PM at Jollibee) or keep one entry but update `location`/`details` to mention both addresses explicitly.

## 9. Admin "Refresh" failures are silently swallowed
- **File:** [`js/admin.js`](js/admin.js) (`refreshButton` click handler) / [`admin.html`](admin.html)
- **Symptom:** If `/api/export` fails while an admin is already logged in (network blip, revoked key, server error), clicking "Refresh" shows no visible feedback — the table just doesn't update.
- **Root cause:** The handler calls `showLoginError(err.message)`, which writes into `#login-message` — an element that lives inside `#login-form`, and `#login-form` is `hidden` for the entire time the admin panel is showing. The error text is set, but on a hidden element, so nothing appears; the admin panel also isn't reset back to the login screen even though the session may no longer be valid.
- **Suggested fix:** Give the admin panel its own visible error slot (or reuse `#admin-summary`), and consider logging the user out (clearing `sessionStorage`, showing the login form) on a 401 specifically.
