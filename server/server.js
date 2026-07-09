const express = require('express');
const cors = require('cors');
const rsvpRouter = require('./routes/rsvp');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.get('/', (_req, res) => {
    res.json({ status: 'ok' });
});

app.use(rsvpRouter);

const port = process.env.PORT || 10000;
app.listen(port, () => {
    console.log(`RSVP API listening on port ${port}`);
});
