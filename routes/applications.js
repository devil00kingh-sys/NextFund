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
    const apps = await db.collection('applications').find(filter).sort({ submitted_at: -1 }).toArray();
    res.json(serializeMany(apps));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/stats', auth, async (req, res) => {
  try {
    const db = await getDb();
    const col = db.collection('applications');
    const [total, pending, approved, rejected] = await Promise.all([
      col.countDocuments({}),
      col.countDocuments({ status: 'pending' }),
      col.countDocuments({ status: 'approved' }),
      col.countDocuments({ status: 'rejected' }),
    ]);
    res.json({ total, pending, approved, rejected });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const db = await getDb();
    const app = await db.collection('applications').findOne({ _id: toId(req.params.id) });
    if (!app) return res.status(404).json({ error: 'Application not found' });
    res.json(serialize(app));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const db = await getDb();
    await db.collection('applications').updateOne({ _id: toId(req.params.id) }, { $set: { status } });
    const app = await db.collection('applications').findOne({ _id: toId(req.params.id) });
    res.json(serialize(app));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const db = await getDb();
    await db.collection('applications').deleteOne({ _id: toId(req.params.id) });
    res.json({ message: 'Application deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/submit', async (req, res) => {
  try {
    const d = req.body;
    const v = k => (d[k] === undefined || d[k] === '') ? null : d[k];
    const db = await getDb();
    await db.collection('applications').insertOne({
      founder_name: v('founder_name'),
      founder_email: v('founder_email'),
      founder_linkedin: v('founder_linkedin'),
      founder_role: v('founder_role'),
      company_name: v('company_name'),
      company_description: v('company_description'),
      company_url: v('company_url'),
      company_location: v('company_location'),
      stage: v('stage'),
      monthly_expenses: v('monthly_expenses'),
      monthly_revenue: v('monthly_revenue'),
      active_users: v('active_users'),
      product_description: v('product_description'),
      motivation: v('motivation'),
      novelty: v('novelty'),
      competitors: v('competitors'),
      unique_insight: v('unique_insight'),
      business_model: v('business_model'),
      incorporated: v('incorporated'),
      incorporation_location: v('incorporation_location'),
      equity_split: v('equity_split'),
      past_funding: v('past_funding'),
      requested_amount: v('requested_amount'),
      batch_preference: v('batch_preference'),
      additional_info: v('additional_info'),
      video_file: v('video_file'),
      demo_file: v('demo_file'),
      status: 'pending',
      submitted_at: new Date()
    });
    res.json({ message: 'Application submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

module.exports = router;
