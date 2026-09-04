const express = require('express');
const { getAll, getOne, runQuery } = require('../database/setup');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', (req, res) => {
  const { status } = req.query;
  let sql = 'SELECT * FROM blogs';
  const params = [];
  if (status && status !== 'all') {
    sql += ' WHERE status = ?';
    params.push(status);
  }
  sql += ' ORDER BY created_at DESC';
  res.json(getAll(sql, params));
});

router.get('/:id', (req, res) => {
  const blog = getOne('SELECT * FROM blogs WHERE id = ?', [req.params.id]);
  if (!blog) return res.status(404).json({ error: 'Blog not found' });
  res.json(blog);
});

router.post('/', auth, (req, res) => {
  const { title, excerpt, content, image_url, author, status } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  runQuery('INSERT INTO blogs (title, excerpt, content, image_url, author, status) VALUES (?,?,?,?,?,?)',
    [title, excerpt, content, image_url, author || 'NXTFund Team', status || 'draft']);
  res.json({ message: 'Blog created' });
});

router.put('/:id', auth, (req, res) => {
  const { title, excerpt, content, image_url, author, status } = req.body;
  runQuery('UPDATE blogs SET title=?, excerpt=?, content=?, image_url=?, author=?, status=? WHERE id=?',
    [title, excerpt, content, image_url, author, status, req.params.id]);
  res.json({ message: 'Blog updated' });
});

router.delete('/:id', auth, (req, res) => {
  runQuery('DELETE FROM blogs WHERE id = ?', [req.params.id]);
  res.json({ message: 'Blog deleted' });
});

module.exports = router;
