require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { put } = require('@vercel/blob');

const app = express();
const IS_VERCEL = !!process.env.VERCEL;

app.use(cors());
app.use(
  express.json({ limit: '20mb' })
);
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

const memoryStorage = multer.memoryStorage();
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'assets', 'uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'))
});
const storage = process.env.BLOB_READ_WRITE_TOKEN ? memoryStorage : diskStorage;
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

app.post('/api/upload', (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const originalName = req.file.originalname.replace(/\s+/g, '-');
    const filename = Date.now() + '-' + originalName;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(filename, req.file.buffer, {
          access: 'public',
          contentType: req.file.mimetype,
          addRandomSuffix: true,
        });
        return res.json({ filename: blob.pathname, path: blob.url });
      } catch (blobErr) {
        return res.status(500).json({ error: 'Upload failed' });
      }
    }

    try {
      const uploadsDir = path.join(__dirname, 'assets', 'uploads');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, req.file.buffer);
      return res.json({ filename, path: `/assets/uploads/${filename}` });
    } catch (writeErr) {
      return res.status(500).json({ error: 'Upload failed' });
    }
  });
});

const authRoutes = require('./routes/auth');
const applicationRoutes = require('./routes/applications');
const eventRoutes = require('./routes/events');
const blogRoutes = require('./routes/blogs');
const startupRoutes = require('./routes/startups');
const partnerRoutes = require('./routes/partners');
const contactRoutes = require('./routes/contacts');
const settingRoutes = require('./routes/settings');

app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/startups', startupRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/settings', settingRoutes);

if (!IS_VERCEL) {
  app.use('/admin', express.static(path.join(__dirname, 'admin')));
  app.use('/assets', express.static(path.join(__dirname, 'assets')));
  app.use('/yc', express.static(path.join(__dirname, 'yc')));

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });

  app.get('*', (req, res) => {
    const filePath = path.join(__dirname, req.path);
    if (filePath.endsWith('.html') && fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).send('Page not found');
    }
  });
}

module.exports = app;
