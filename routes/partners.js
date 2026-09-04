const express = require('express');
const { getAll, getOne, runQuery } = require('../database/setup');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', (req, res) => {
  const { category } = req.query;
  let sql = 'SELECT * FROM partners';
  const params = [];
  if (category && category !== 'all') {
    sql += ' WHERE category = ?';
    params.push(category);
  }
  sql += ' ORDER BY created_at DESC';
  res.json(getAll(sql, params));
});

router.get('/:id', (req, res) => {
  const p = getOne('SELECT * FROM partners WHERE id = ?', [req.params.id]);
  if (!p) return res.status(404).json({ error: 'Partner not found' });
  res.json(p);
});

router.post('/', auth, (req, res) => {
  const { name, description, logo_url, category, website } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  runQuery('INSERT INTO partners (name, description, logo_url, category, website) VALUES (?,?,?,?,?)',
    [name, description, logo_url, category, website]);
  res.json({ message: 'Partner created' });
});

router.put('/:id', auth, (req, res) => {
  const { name, description, logo_url, category, website } = req.body;
  runQuery('UPDATE partners SET name=?, description=?, logo_url=?, category=?, website=? WHERE id=?',
    [name, description, logo_url, category, website, req.params.id]);
  res.json({ message: 'Partner updated' });
});

router.delete('/:id', auth, (req, res) => {
  runQuery('DELETE FROM partners WHERE id = ?', [req.params.id]);
  res.json({ message: 'Partner deleted' });
});

module.exports = router;
