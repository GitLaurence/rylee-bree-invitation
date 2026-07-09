const { list, get } = require('@vercel/blob');

async function streamToString(stream) {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString('utf-8');
}

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const providedKey = req.headers['x-admin-key'] || req.query.key;
    if (!process.env.ADMIN_EXPORT_KEY || providedKey !== process.env.ADMIN_EXPORT_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const entries = [];
        let cursor;
        do {
            const page = await list({ prefix: 'rsvps/', cursor, limit: 1000 });
            for (const blob of page.blobs) {
                const result = await get(blob.pathname, { access: 'private' });
                if (result) {
                    entries.push(JSON.parse(await streamToString(result.stream)));
                }
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
