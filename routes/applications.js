const express = require('express');
const { getAll, getOne, runQuery } = require('../database/setup');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, (req, res) => {
  const { status } = req.query;
  let sql = 'SELECT * FROM applications';
  const params = [];
  if (status && status !== 'all') {
    sql += ' WHERE status = ?';
    params.push(status);
  }
  sql += ' ORDER BY submitted_at DESC';
  const apps = getAll(sql, params);
  res.json(apps);
});

router.get('/stats', auth, (req, res) => {
  const total = getAll('SELECT COUNT(*) as count FROM applications')[0]?.count || 0;
  const pending = getAll("SELECT COUNT(*) as count FROM applications WHERE status = 'pending'")[0]?.count || 0;
  const approved = getAll("SELECT COUNT(*) as count FROM applications WHERE status = 'approved'")[0]?.count || 0;
  const rejected = getAll("SELECT COUNT(*) as count FROM applications WHERE status = 'rejected'")[0]?.count || 0;
  res.json({ total, pending, approved, rejected });
});

router.get('/:id', auth, (req, res) => {
  const app = getOne('SELECT * FROM applications WHERE id = ?', [req.params.id]);
  if (!app) return res.status(404).json({ error: 'Application not found' });
  res.json(app);
});

router.put('/:id', auth, (req, res) => {
  const { status } = req.body;
  if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  runQuery('UPDATE applications SET status = ? WHERE id = ?', [status, req.params.id]);
  const app = getOne('SELECT * FROM applications WHERE id = ?', [req.params.id]);
  res.json(app);
});

router.delete('/:id', auth, (req, res) => {
  runQuery('DELETE FROM applications WHERE id = ?', [req.params.id]);
  res.json({ message: 'Application deleted' });
});

router.post('/submit', (req, res) => {
  try {
    const d = req.body;
    const v = k => (d[k] === undefined ? null : d[k]);
    runQuery(`INSERT INTO applications (founder_name, founder_email, founder_linkedin, founder_role, company_name, company_description, company_url, company_location, stage, monthly_expenses, monthly_revenue, active_users, product_description, motivation, novelty, competitors, unique_insight, business_model, incorporated, incorporation_location, equity_split, past_funding, requested_amount, batch_preference, additional_info, video_file, demo_file) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [v('founder_name'), v('founder_email'), v('founder_linkedin'), v('founder_role'), v('company_name'), v('company_description'), v('company_url'), v('company_location'), v('stage'), v('monthly_expenses'), v('monthly_revenue'), v('active_users'), v('product_description'), v('motivation'), v('novelty'), v('competitors'), v('unique_insight'), v('business_model'), v('incorporated'), v('incorporation_location'), v('equity_split'), v('past_funding'), v('requested_amount'), v('batch_preference'), v('additional_info'), v('video_file'), v('demo_file')]
    );
    res.json({ message: 'Application submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

module.exports = router;
