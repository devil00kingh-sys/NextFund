const express = require('express');
const { getDb, toId, serialize, serializeMany } = require('../database/setup');
const auth = require('../middleware/auth');
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

router.post('/', auth, async (req, res) => {
  try {
    const { title, description, date, time, location, type, image_url } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const db = await getDb();
    await db.collection('events').insertOne({
      title, description, date, time, location, type: type || 'upcoming', image_url,
      created_at: new Date()
    });
    res.json({ message: 'Event created' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, date, time, location, type, image_url } = req.body;
    const db = await getDb();
    await db.collection('events').updateOne({ _id: toId(req.params.id) },
      { $set: { title, description, date, time, location, type, image_url } });
    res.json({ message: 'Event updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const db = await getDb();
    await db.collection('events').deleteOne({ _id: toId(req.params.id) });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
