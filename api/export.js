const { list } = require('@vercel/blob');

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!process.env.ADMIN_EXPORT_KEY || req.query.key !== process.env.ADMIN_EXPORT_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const entries = [];
        let cursor;
        do {
            const page = await list({ prefix: 'rsvps/', cursor, limit: 1000 });
            for (const blob of page.blobs) {
                const response = await fetch(blob.url);
                entries.push(await response.json());
            }
            cursor = page.cursor;
        } while (cursor);

        entries.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        res.setHeader('Content-Disposition', 'attachment; filename="rsvps-export.json"');
        return res.status(200).json(entries);
    } catch (err) {
        console.error('Failed to export RSVPs:', err);
        return res.status(500).json({ error: 'Something went wrong.' });
    }
};
