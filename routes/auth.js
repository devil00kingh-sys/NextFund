const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getOne, runQuery } = require('../database/setup');
const auth = require('../middleware/auth');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'nxtfund_super_secret_key_2026';

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const admin = getOne('SELECT * FROM admins WHERE email = ?', [email]);
    if (!admin) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: admin.id, email: admin.email, name: admin.name }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      admin: { id: admin.id, email: admin.email, name: admin.name }
    });
  } catch (err) {
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

    const admin = getOne('SELECT * FROM admins WHERE id = ?', [req.admin.id]);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const valid = await bcrypt.compare(String(currentPassword), admin.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hash = await bcrypt.hash(String(newPassword), 10);
    runQuery('UPDATE admins SET password_hash = ? WHERE id = ?', [hash, req.admin.id]);

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
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

    const admin = getOne('SELECT * FROM admins WHERE id = ?', [req.admin.id]);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const valid = await bcrypt.compare(String(currentPassword), admin.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const existing = getOne('SELECT id FROM admins WHERE email = ?', [String(newEmail).toLowerCase()]);
    if (existing && existing.id !== admin.id) {
      return res.status(409).json({ error: 'This email is already in use' });
    }

    runQuery('UPDATE admins SET email = ? WHERE id = ?', [String(newEmail).toLowerCase(), req.admin.id]);

    const newToken = jwt.sign({ id: admin.id, email: String(newEmail).toLowerCase(), name: admin.name }, JWT_SECRET, { expiresIn: '24h' });

    res.json({ message: 'Email changed successfully', token: newToken, admin: { id: admin.id, email: String(newEmail).toLowerCase(), name: admin.name } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/logout', auth, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
