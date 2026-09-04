const express = require('express');
const { getDb, toId, serialize, serializeMany } = require('../database/setup');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const db = await getDb();
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    const contacts = await db.collection('contacts').find(filter).sort({ created_at: -1 }).toArray();
    res.json(serializeMany(contacts));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/stats', auth, async (req, res) => {
  try {
    const db = await getDb();
    const col = db.collection('contacts');
    const [total, unread] = await Promise.all([
      col.countDocuments({}),
      col.countDocuments({ status: 'unread' }),
    ]);
    res.json({ total, unread });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const db = await getDb();
    const c = await db.collection('contacts').findOne({ _id: toId(req.params.id) });
    if (!c) return res.status(404).json({ error: 'Contact not found' });
    if (c.status === 'unread') {
      await db.collection('contacts').updateOne({ _id: c._id }, { $set: { status: 'read' } });
      c.status = 'read';
    }
    res.json(serialize(c));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['unread', 'read', 'replied'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const db = await getDb();
    await db.collection('contacts').updateOne({ _id: toId(req.params.id) }, { $set: { status } });
    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const db = await getDb();
    await db.collection('contacts').deleteOne({ _id: toId(req.params.id) });
    res.json({ message: 'Contact deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/submit', async (req, res) => {
  try {
    const { name, email, subject, message, file_name } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });
    const db = await getDb();
    await db.collection('contacts').insertOne({
      name, email, subject, message, file_name: file_name || null,
      status: 'unread',
      created_at: new Date()
    });
    res.json({ message: 'Message sent successfully' });
  } catch (err) {
    console.error('Contact submit error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
