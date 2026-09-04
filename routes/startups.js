const express = require('express');
const { getDb, toId, serialize, serializeMany } = require('../database/setup');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const db = await getDb();
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    const startups = await db.collection('startups').find(filter).sort({ created_at: -1 }).toArray();
    res.json(serializeMany(startups));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const s = await db.collection('startups').findOne({ _id: toId(req.params.id) });
    if (!s) return res.status(404).json({ error: 'Startup not found' });
    res.json(serialize(s));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, description, logo_url, website, sector, status } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const db = await getDb();
    await db.collection('startups').insertOne({
      name, description, logo_url, website, sector, status: status || 'active',
      created_at: new Date()
    });
    res.json({ message: 'Startup created' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, logo_url, website, sector, status } = req.body;
    const db = await getDb();
    await db.collection('startups').updateOne({ _id: toId(req.params.id) },
      { $set: { name, description, logo_url, website, sector, status } });
    res.json({ message: 'Startup updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const db = await getDb();
    await db.collection('startups').deleteOne({ _id: toId(req.params.id) });
    res.json({ message: 'Startup deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
