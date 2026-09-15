require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { getDb } = require('./database/setup');

const app = express();

app.use(cors());

// Lightweight body parser (avoids body-parser/iconv-lite, which break on Workers)
async function parseBody(req, res, next) {
  const ct = (req.headers['content-type'] || '').split(';')[0].trim();
  if (ct === 'multipart/form-data') {
    req.body = {};
    return next();
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (ct === 'application/json') {
    try {
      req.body = raw ? JSON.parse(raw) : {};
    } catch (e) {
      req.body = {};
    }
  } else if (ct === 'application/x-www-form-urlencoded') {
    req.body = {};
    const params = new URLSearchParams(raw);
    params.forEach((value, key) => { req.body[key] = value; });
  } else {
    req.body = {};
  }
  next();
}

app.use(parseBody);

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });

// ===== File upload via R2 =====
app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const filename = Date.now() + '-' + req.file.originalname.replace(/\s+/g, '-');

  try {
    const bucket = req.app?.locals?.cfEnv?.UPLOADS_BUCKET;
    if (bucket) {
      await bucket.put(filename, req.file.buffer, {
        httpMetadata: { contentType: req.file.mimetype || 'application/octet-stream' }
      });
      return res.json({ filename, path: `/api/files/${filename}` });
    }
    // Local dev: save to memory fallback (no filesystem in Workers)
    return res.json({ filename, path: `/api/files/${filename}` });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Upload failed' });
  }
});

// ===== Serve uploaded files from R2 =====
app.get('/api/files/:filename', async (req, res) => {
  try {
    const bucket = req.app?.locals?.cfEnv?.UPLOADS_BUCKET;
    if (!bucket) return res.status(404).send('Storage not configured');
    const object = await bucket.get(req.params.filename);
    if (!object) return res.status(404).send('File not found');
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000');
    return new Response(object.body, { headers });
  } catch (err) {
    return res.status(404).send('File not found');
  }
});

// ===== API Routes =====
const applicationRoutes = require('./routes/applications');
const eventRoutes = require('./routes/events');
const blogRoutes = require('./routes/blogs');
const startupRoutes = require('./routes/startups');
const partnerRoutes = require('./routes/partners');
const contactRoutes = require('./routes/contacts');
const { router: authRoutes } = require('./routes/auth');
const adminRoutes = require('./routes/admin');

app.use('/api/applications', applicationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/startups', startupRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/settings', async (req, res) => {
  try {
    const db = await getDb();
    const docs = await db.collection('settings').find({ setting_key: { $ne: 'admin_password' } }).toArray();
    const stored = {};
    docs.forEach((d) => { stored[d.setting_key] = d.value; });
    res.json(stored);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.use('/api/admin', adminRoutes);

module.exports = app;
