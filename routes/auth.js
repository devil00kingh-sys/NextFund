const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb, toId, ObjectId } = require('../database/setup');
const auth = require('../middleware/auth');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'nxtfund_super_secret_key_2026';

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = await getDb();
    const admin = await db.collection('admins').findOne({ email: String(email).toLowerCase() });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: admin._id.toString(), email: admin.email, name: admin.name }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      admin: { id: admin._id.toString(), email: admin.email, name: admin.name }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me', auth, (req, res) => {
  res.json({ admin: req.admin });
});

router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const db = await getDb();
    const admin = await db.collection('admins').findOne({ _id: toId(req.admin.id) });
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const valid = await bcrypt.compare(String(currentPassword), admin.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hash = await bcrypt.hash(String(newPassword), 10);
    await db.collection('admins').updateOne({ _id: admin._id }, { $set: { password_hash: hash } });

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/email', auth, async (req, res) => {
  try {
    const { currentPassword, newEmail } = req.body;

    if (!currentPassword || !newEmail) {
      return res.status(400).json({ error: 'Current password and new email are required' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(newEmail))) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    const db = await getDb();
    const admin = await db.collection('admins').findOne({ _id: toId(req.admin.id) });
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const valid = await bcrypt.compare(String(currentPassword), admin.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const existing = await db.collection('admins').findOne({ email: String(newEmail).toLowerCase() });
    if (existing && existing._id.toString() !== admin._id.toString()) {
      return res.status(409).json({ error: 'This email is already in use' });
    }

    await db.collection('admins').updateOne({ _id: admin._id }, { $set: { email: String(newEmail).toLowerCase() } });

    const newToken = jwt.sign({ id: admin._id.toString(), email: String(newEmail).toLowerCase(), name: admin.name }, JWT_SECRET, { expiresIn: '24h' });

    res.json({ message: 'Email changed successfully', token: newToken, admin: { id: admin._id.toString(), email: String(newEmail).toLowerCase(), name: admin.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/logout', auth, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
