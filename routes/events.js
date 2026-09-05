const express = require('express');
const { getDb, toId, serialize, serializeMany } = require('../database/setup');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const db = await getDb();
    const filter = {};
    if (type && type !== 'all') filter.type = type;
    const events = await db.collection('events').find(filter).sort({ date: -1 }).toArray();
    res.json(serializeMany(events));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const event = await db.collection('events').findOne({ _id: toId(req.params.id) });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(serialize(event));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;