const express = require('express');
const { getAll, getOne, runQuery } = require('../database/setup');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, (req, res) => {
  const { status } = req.query;
  let sql = 'SELECT * FROM contacts';
  const params = [];
  if (status && status !== 'all') {
    sql += ' WHERE status = ?';
    params.push(status);
  }
  sql += ' ORDER BY created_at DESC';
  res.json(getAll(sql, params));
});

router.get('/stats', auth, (req, res) => {
  const total = getAll('SELECT COUNT(*) as count FROM contacts')[0]?.count || 0;
  const unread = getAll("SELECT COUNT(*) as count FROM contacts WHERE status = 'unread'")[0]?.count || 0;
  res.json({ total, unread });
});

router.get('/:id', auth, (req, res) => {
  const c = getOne('SELECT * FROM contacts WHERE id = ?', [req.params.id]);
  if (!c) return res.status(404).json({ error: 'Contact not found' });
  runQuery("UPDATE contacts SET status = 'read' WHERE id = ? AND status = 'unread'", [req.params.id]);
  res.json(c);
});

router.put('/:id', auth, (req, res) => {
  const { status } = req.body;
  if (!status || !['unread', 'read', 'replied'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  runQuery('UPDATE contacts SET status = ? WHERE id = ?', [status, req.params.id]);
  res.json({ message: 'Status updated' });
});

router.delete('/:id', auth, (req, res) => {
  runQuery('DELETE FROM contacts WHERE id = ?', [req.params.id]);
  res.json({ message: 'Contact deleted' });
});

router.post('/submit', (req, res) => {
  try {
    const { name, email, subject, message, file_name } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });
    runQuery('INSERT INTO contacts (name, email, subject, message, file_name) VALUES (?,?,?,?,?)',
      [name, email, subject, message, file_name || null]);
    res.json({ message: 'Message sent successfully' });
  } catch (err) {
    console.error('Contact submit error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
