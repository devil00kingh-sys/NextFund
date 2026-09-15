const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist');

const entries = [
  'index.html',
  'about.html',
  'admin.html',
  'blog-insights.html',
  'contact-us.html',
  'events.html',
  'gallery.html',
  'investor-brief.html',
  'partners.html',
  'school.html',
  'startups.html',
  'terms-privacy.html',
  'favicon.png',
  'assets',
  'yc'
];

function emptyDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    return;
  }
  for (const file of fs.readdirSync(dir)) {
    const curPath = path.join(dir, file);
    try {
      fs.rmSync(curPath, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
    } catch (e) {
      // ignore
    }
  }
}

emptyDir(dist);

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'admin' || entry.name === 'uploads') continue;
      copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

for (const entry of entries) {
  const s = path.join(root, entry);
  if (!fs.existsSync(s)) {
    console.warn('[build] missing entry (skipping):', entry);
    continue;
  }
  const d = path.join(dist, entry);
  const stat = fs.statSync(s);
  if (stat.isDirectory()) {
    copyDir(s, d);
  } else {
    fs.mkdirSync(path.dirname(d), { recursive: true });
    fs.copyFileSync(s, d);
  }
}

console.log('[build] Static assets copied to dist/');