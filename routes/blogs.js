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
    const blogs = await db.collection('blogs').find(filter).sort({ created_at: -1 }).toArray();
    res.json(serializeMany(blogs));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const blog = await db.collection('blogs').findOne({ _id: toId(req.params.id) });
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json(serialize(blog));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, excerpt, content, image_url, author, status } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const db = await getDb();
    await db.collection('blogs').insertOne({
      title, excerpt, content, image_url, author: author || 'NXTFund Team', status: status || 'draft',
      created_at: new Date()
    });
    res.json({ message: 'Blog created' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { title, excerpt, content, image_url, author, status } = req.body;
    const db = await getDb();
    await db.collection('blogs').updateOne({ _id: toId(req.params.id) },
      { $set: { title, excerpt, content, image_url, author, status } });
    res.json({ message: 'Blog updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const db = await getDb();
    await db.collection('blogs').deleteOne({ _id: toId(req.params.id) });
    res.json({ message: 'Blog deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
