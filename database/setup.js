const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'nxtfund.db');

let db = null;

async function getDb() {
  if (db) return db;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA journal_mode = WAL;');
  db.run('PRAGMA foreign_keys = ON;');

  createTables();
  await seedAdmin();

  saveDb();
  return db;
}

function createTables() {
  db.run(`CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT 'Admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    founder_name TEXT,
    founder_email TEXT,
    founder_linkedin TEXT,
    founder_role TEXT,
    company_name TEXT,
    company_description TEXT,
    company_url TEXT,
    company_location TEXT,
    stage TEXT DEFAULT 'idea',
    monthly_expenses TEXT,
    monthly_revenue TEXT,
    active_users TEXT,
    product_description TEXT,
    motivation TEXT,
    novelty TEXT,
    competitors TEXT,
    unique_insight TEXT,
    business_model TEXT,
    incorporated TEXT,
    incorporation_location TEXT,
    equity_split TEXT,
    past_funding TEXT,
    requested_amount TEXT,
    batch_preference TEXT,
    additional_info TEXT,
    video_file TEXT,
    demo_file TEXT,
    status TEXT DEFAULT 'pending',
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT,
    time TEXT,
    location TEXT,
    type TEXT DEFAULT 'upcoming',
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS blogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT,
    image_url TEXT,
    author TEXT DEFAULT 'NXTFund Team',
    status TEXT DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS startups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    website TEXT,
    sector TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS partners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    category TEXT,
    website TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT,
    file_name TEXT,
    status TEXT DEFAULT 'unread',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  const defaultSettings = [
    ['hero_title', 'Build For Founders'],
    ['hero_subtitle', 'Discovering and scaling early-stage startups from India and around the world'],
    ['stat_startups', '50+'],
    ['stat_funding', '100 Cr+'],
    ['stat_mentors', '200+'],
    ['stat_startups_label', 'Startups Funded'],
    ['stat_funding_label', 'Total Funding'],
    ['stat_mentors_label', 'Expert Mentors'],
    ['about_mission', 'NXTFund is the investment arm of Celebso Group, focused on discovering, supporting, and scaling early-stage startups.'],
    ['contact_email', 'Startup.nxtfund@gmail.com'],
    ['site_title', 'NXT Fund - Build For Founders'],
  ];

  for (const [key, value] of defaultSettings) {
    db.run(`INSERT OR IGNORE INTO settings (setting_key, setting_value) VALUES (?, ?)`, [key, value]);
  }
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@nxtfund.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const name = 'Admin';

  const result = db.exec(`SELECT id FROM admins WHERE email = '${email}'`);
  if (result.length === 0 || result[0].values.length === 0) {
    const hash = await bcrypt.hash(password, 10);
    db.run(`INSERT INTO admins (email, password_hash, name) VALUES (?, ?, ?)`, [email, hash, name]);
    console.log(`Admin seeded: ${email}`);
  }
}

function saveDb() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function runQuery(sql, params = []) {
  db.run(sql, params);
  saveDb();
}

function getAll(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function getOne(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  let result = null;
  if (stmt.step()) {
    result = stmt.getAsObject();
  }
  stmt.free();
  return result;
}

module.exports = { getDb, saveDb, runQuery, getAll, getOne };
