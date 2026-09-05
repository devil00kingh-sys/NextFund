const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

let ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
if (!process.env.ADMIN_PASSWORD) {
  console.warn('[auth] ADMIN_PASSWORD not set in .env - using default "admin123"');
}

function checkAdminPassword(password) {
  return !!password && password === ADMIN_PASSWORD;
}

function persistAdminPassword(newPassword) {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    if (!fs.existsSync(envPath)) return;
    let content = fs.readFileSync(envPath, 'utf8');
    if (/^ADMIN_PASSWORD=.*$/m.test(content)) {
      content = content.replace(/^ADMIN_PASSWORD=.*$/m, `ADMIN_PASSWORD=${newPassword}`);
    } else {
      content += `\nADMIN_PASSWORD=${newPassword}\n`;
    }
    fs.writeFileSync(envPath, content);
  } catch (err) {
    console.error('[auth] Failed to persist password to .env', err);
  }
}

function changeAdminPassword(newPassword) {
  ADMIN_PASSWORD = newPassword;
  persistAdminPassword(newPassword);
}

const SESSION_TTL = 7 * 24 * 60 * 60 * 1000;
const sessions = new Map();

function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const session = token ? sessions.get(token) : null;
  if (!session || session.expiresAt < Date.now()) {
    if (token) sessions.delete(token);
    return res.status(401).json({ error: 'Unauthorized' });
  }
  session.expiresAt = Date.now() + SESSION_TTL;
  req.adminToken = token;
  next();
}

const router = express.Router();

router.post('/login', (req, res) => {
  const { password } = req.body || {};
  if (!checkAdminPassword(password)) {
    return res.status(401).json({ error: 'Incorrect password' });
  }
  const token = crypto.randomBytes(24).toString('hex');
  sessions.set(token, { expiresAt: Date.now() + SESSION_TTL });
  res.json({ token });
});

router.post('/logout', authRequired, (req, res) => {
  sessions.delete(req.adminToken);
  res.json({ message: 'Logged out' });
});

router.get('/check', authRequired, (req, res) => {
  res.json({ ok: true });
});

module.exports = { router, authRequired, checkAdminPassword, changeAdminPassword };