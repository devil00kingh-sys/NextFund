const express = require('express');
const { getDb } = require('../database/setup');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const settings = await db.collection('settings').find({}).toArray();
    const obj = {};
    settings.forEach(s => { obj[s.setting_key] = s.setting_value; });
    res.json(obj);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/', auth, async (req, res) => {
  try {
    const db = await getDb();
    const col = db.collection('settings');
    const settings = req.body;
    for (const [key, value] of Object.entries(settings)) {
      await col.updateOne(
        { setting_key: key },
        { $set: { setting_value: value, updated_at: new Date() } },
        { upsert: true }
      );
    }
    res.json({ message: 'Settings updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
