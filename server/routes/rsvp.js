const express = require('express');
const pool = require('../db');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/rsvp', async (req, res) => {
    const { full_name, email, attending, guest_count, meal_preference, message } = req.body || {};

    if (typeof full_name !== 'string' || !full_name.trim()) {
        return res.status(400).json({ error: 'full_name is required' });
    }
    if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
        return res.status(400).json({ error: 'a valid email is required' });
    }
    if (typeof attending !== 'boolean') {
        return res.status(400).json({ error: 'attending must be true or false' });
    }
    const guestCount = Number.isInteger(guest_count) ? guest_count : 0;
    if (guestCount < 0 || guestCount > 20) {
        return res.status(400).json({ error: 'guest_count must be between 0 and 20' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO rsvps (full_name, email, attending, guest_count, meal_preference, message)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, created_at`,
            [full_name.trim(), email.trim(), attending, guestCount, meal_preference || null, message || null]
        );
        return res.status(201).json({ success: true, rsvp: result.rows[0] });
    } catch (err) {
        console.error('Failed to insert RSVP:', err);
        return res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
});

module.exports = router;
