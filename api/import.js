const { put } = require('@vercel/blob');
const crypto = require('crypto');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!process.env.ADMIN_EXPORT_KEY || req.query.key !== process.env.ADMIN_EXPORT_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const entries = req.body;
    if (!Array.isArray(entries)) {
        return res.status(400).json({ error: 'Body must be a JSON array of RSVP entries' });
    }

    try {
        let imported = 0;
        for (const entry of entries) {
            const id = entry.id || crypto.randomUUID();
            await put(`rsvps/${id}.json`, JSON.stringify({ ...entry, id }), {
                access: 'public',
                addRandomSuffix: false,
                contentType: 'application/json',
            });
            imported += 1;
        }
        return res.status(200).json({ success: true, imported });
    } catch (err) {
        console.error('Failed to import RSVPs:', err);
        return res.status(500).json({ error: 'Something went wrong.' });
    }
};
