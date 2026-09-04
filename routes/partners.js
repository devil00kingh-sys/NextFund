const express = require('express');
const { getDb, toId, serialize, serializeMany } = require('../database/setup');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const db = await getDb();
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    const partners = await db.collection('partners').find(filter).sort({ created_at: -1 }).toArray();
    res.json(serializeMany(partners));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const p = await db.collection('partners').findOne({ _id: toId(req.params.id) });
    if (!p) return res.status(404).json({ error: 'Partner not found' });
    res.json(serialize(p));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, description, logo_url, category, website } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const db = await getDb();
    await db.collection('partners').insertOne({
      name, description, logo_url, category, website,
      created_at: new Date()
    });
    res.json({ message: 'Partner created' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, logo_url, category, website } = req.body;
    const db = await getDb();
    await db.collection('partners').updateOne({ _id: toId(req.params.id) },
      { $set: { name, description, logo_url, category, website } });
    res.json({ message: 'Partner updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const db = await getDb();
    await db.collection('partners').deleteOne({ _id: toId(req.params.id) });
    res.json({ message: 'Partner deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
