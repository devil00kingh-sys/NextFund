require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { getDb } = require('./database/setup');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'assets', 'uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'))
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

app.post('/api/upload', (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ filename: req.file.filename, path: `/assets/uploads/${req.file.filename}` });
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

app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/yc', express.static(path.join(__dirname, 'yc')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('*', (req, res) => {
  const filePath = path.join(__dirname, req.path);
  if (filePath.endsWith('.html') && require('fs').existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('Page not found');
  }
});

async function start() {
  await getDb();
  const fs = require('fs');
  const uploadsDir = path.join(__dirname, 'assets', 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  app.listen(PORT, () => {
    console.log(`NXTFund Server running on http://localhost:${PORT}`);
    console.log(`Admin Panel: http://localhost:${PORT}/admin/`);
    console.log(`Main Site:   http://localhost:${PORT}/`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
