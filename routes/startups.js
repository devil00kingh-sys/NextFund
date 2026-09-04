const express = require('express');
const { getAll, getOne, runQuery } = require('../database/setup');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', (req, res) => {
  const { status } = req.query;
  let sql = 'SELECT * FROM startups';
  const params = [];
  if (status && status !== 'all') {
    sql += ' WHERE status = ?';
    params.push(status);
  }
  sql += ' ORDER BY created_at DESC';
  res.json(getAll(sql, params));
});

router.get('/:id', (req, res) => {
  const s = getOne('SELECT * FROM startups WHERE id = ?', [req.params.id]);
  if (!s) return res.status(404).json({ error: 'Startup not found' });
  res.json(s);
});

router.post('/', auth, (req, res) => {
  const { name, description, logo_url, website, sector, status } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  runQuery('INSERT INTO startups (name, description, logo_url, website, sector, status) VALUES (?,?,?,?,?,?)',
    [name, description, logo_url, website, sector, status || 'active']);
  res.json({ message: 'Startup created' });
});

router.put('/:id', auth, (req, res) => {
  const { name, description, logo_url, website, sector, status } = req.body;
  runQuery('UPDATE startups SET name=?, description=?, logo_url=?, website=?, sector=?, status=? WHERE id=?',
    [name, description, logo_url, website, sector, status, req.params.id]);
  res.json({ message: 'Startup updated' });
});

router.delete('/:id', auth, (req, res) => {
  runQuery('DELETE FROM startups WHERE id = ?', [req.params.id]);
  res.json({ message: 'Startup deleted' });
});

module.exports = router;
