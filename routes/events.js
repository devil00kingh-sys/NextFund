const express = require('express');
const { getAll, getOne, runQuery } = require('../database/setup');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', (req, res) => {
  const { type } = req.query;
  let sql = 'SELECT * FROM events';
  const params = [];
  if (type && type !== 'all') {
    sql += ' WHERE type = ?';
    params.push(type);
  }
  sql += ' ORDER BY date DESC';
  res.json(getAll(sql, params));
});

router.get('/:id', (req, res) => {
  const event = getOne('SELECT * FROM events WHERE id = ?', [req.params.id]);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(event);
});

router.post('/', auth, (req, res) => {
  const { title, description, date, time, location, type, image_url } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  runQuery('INSERT INTO events (title, description, date, time, location, type, image_url) VALUES (?,?,?,?,?,?,?)',
    [title, description, date, time, location, type || 'upcoming', image_url]);
  res.json({ message: 'Event created' });
});

router.put('/:id', auth, (req, res) => {
  const { title, description, date, time, location, type, image_url } = req.body;
  runQuery('UPDATE events SET title=?, description=?, date=?, time=?, location=?, type=?, image_url=? WHERE id=?',
    [title, description, date, time, location, type, image_url, req.params.id]);
  res.json({ message: 'Event updated' });
});

router.delete('/:id', auth, (req, res) => {
  runQuery('DELETE FROM events WHERE id = ?', [req.params.id]);
  res.json({ message: 'Event deleted' });
});

module.exports = router;
