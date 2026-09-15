import { getDb } from '../../database/setup.js';

export async function onRequest(context) {
  try {
    const db = await getDb();
    const count = await db.collection('events').countDocuments();
    return Response.json({ ok: true, events: count });
  } catch (err) {
    return Response.json({ ok: false, error: String(err && err.message || err), stack: String(err && err.stack) }, { status: 500 });
  }
}