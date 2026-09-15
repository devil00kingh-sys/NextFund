const { MongoClient, ObjectId } = require('mongodb');

let client = null;
let db = null;
let connected = false;

function getClient() {
  if (client) return client;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is required');
  }
  client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  });
  return client;
}

async function connect() {
  if (connected && db) return db;
  const c = getClient();
  await c.connect();
  const dbName = process.env.MONGODB_DB || 'nxtfund';
  db = c.db(dbName);
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
  await db.collection('settings').createIndex({ setting_key: 1 }, { unique: true });
}

async function getDb(options = {}) {
  const database = await connect();
  if (!options.skipInit) {
    await ensureInit(database);
  }
  return database;
}

module.exports = { getDb, connect, toId, serialize, serializeMany, ObjectId };
