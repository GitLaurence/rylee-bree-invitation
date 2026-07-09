const { put } = require('@vercel/blob');
const crypto = require('crypto');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

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

    const entry = {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        full_name: full_name.trim(),
        email: email.trim(),
        attending,
        guest_count: guestCount,
        meal_preference: meal_preference || null,
        message: message || null,
    };

    try {
        await put(`rsvps/${entry.id}.json`, JSON.stringify(entry), {
            access: 'private',
            addRandomSuffix: false,
            contentType: 'application/json',
        });
        return res.status(201).json({ success: true, rsvp: entry });
    } catch (err) {
        console.error('Failed to store RSVP:', err);
        return res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
};
