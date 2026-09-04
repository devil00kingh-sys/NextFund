const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is required');
}

const DB_NAME = process.env.MONGODB_DB || 'nxtfund';

const client = new MongoClient(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
});

let db = null;
let connected = false;

async function connect() {
  if (connected && db) return db;
  await client.connect();
  db = client.db(DB_NAME);
  connected = true;
  return db;
}

function toId(id) {
  try {
    return typeof id === 'string' ? new ObjectId(id) : id;
  } catch (err) {
    return null;
  }
}

function serialize(doc) {
  if (!doc) return doc;
  const out = { ...doc };
  if (out._id) {
    out.id = out._id.toString();
    delete out._id;
  }
  return out;
}

function serializeMany(docs) {
  return (docs || []).map(serialize);
}

async function ensureInit(db) {
  await db.collection('admins').createIndex({ email: 1 }, { unique: true });
  await db.collection('settings').createIndex({ setting_key: 1 }, { unique: true });

  const adminCount = await db.collection('admins').countDocuments();
  if (adminCount === 0) {
    const bcrypt = require('bcryptjs');
    const email = (process.env.ADMIN_EMAIL || 'admin@nxtfund.com').toLowerCase();
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const hash = await bcrypt.hash(password, 10);
    await db.collection('admins').insertOne({ email, password_hash: hash, name: 'Admin', created_at: new Date() });
  }

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
    await db.collection('settings').updateOne(
      { setting_key: key },
      { $setOnInsert: { setting_key: key, setting_value: value, updated_at: new Date() } },
      { upsert: true }
    );
  }
}

async function getDb(options = {}) {
  const database = await connect();
  if (!options.skipInit) {
    await ensureInit(database);
  }
  return database;
}

module.exports = { getDb, connect, toId, serialize, serializeMany, ObjectId };
