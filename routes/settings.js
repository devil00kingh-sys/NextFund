const express = require('express');
const { getAll, getOne, runQuery } = require('../database/setup');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', (req, res) => {
  const settings = getAll('SELECT * FROM settings');
  const obj = {};
  settings.forEach(s => { obj[s.setting_key] = s.setting_value; });
  res.json(obj);
});

router.put('/', auth, (req, res) => {
  const settings = req.body;
  for (const [key, value] of Object.entries(settings)) {
    const existing = getOne('SELECT id FROM settings WHERE setting_key = ?', [key]);
    if (existing) {
      runQuery('UPDATE settings SET setting_value = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?', [value, key]);
    } else {
      runQuery('INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)', [key, value]);
    }
  }
  res.json({ message: 'Settings updated' });
});

module.exports = router;
