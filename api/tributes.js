import { kv } from '@vercel/kv';

const PUBLIC_KEY = 'everlasting_tributes_public';
const PENDING_KEY = 'everlasting_tributes_pending';
const REJECTED_KEY = 'everlasting_tributes_rejected';
const MAX_RECORDS = 200;

function clean(value, maxLength) {
  return String(value || '').replace(/[<>]/g, '').trim().slice(0, maxLength);
}

function parseItem(item) {
  try {
    return typeof item === 'string' ? JSON.parse(item) : item;
  } catch {
    return null;
  }
}

function jsonBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'object') return req.body;
  try {
    return JSON.parse(req.body);
  } catch {
    return {};
  }
}

function sameSecret(left, right) {
  if (!left || !right || left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
}

function adminAuthorized(req) {
  const configured = process.env.TRIBUTE_ADMIN_TOKEN;
  const authorization = String(req.headers.authorization || '');
  const supplied = authorization.startsWith('Bearer ')
    ? authorization.slice(7).trim()
    : String(req.headers['x-tribute-admin-token'] || '').trim();
  return Boolean(configured && supplied && sameSecret(supplied, configured));
}

function publicRecord(item) {
  return {
    message: clean(item.message, 600),
    author: clean(item.author, 60),
    kind: clean(item.kind || 'FROM THE WALL', 32)
  };
}

function reviewRecord(item) {
  return {
    id: clean(item.id, 100),
    author: clean(item.author, 60),
    message: clean(item.message, 600),
    kind: clean(item.kind || 'NEW VOICE', 32),
    status: clean(item.status || 'pending', 24),
    submittedAt: clean(item.submittedAt, 40),
    updatedAt: clean(item.updatedAt, 40),
    moderatedAt: clean(item.moderatedAt, 40)
  };
}

async function pendingRecords() {
  const records = await kv.lrange(PENDING_KEY, 0, MAX_RECORDS - 1);
  return (records || []).map(parseItem).filter((item) => item && item.id && item.message && item.author);
}

async function updatePendingAt(index, record) {
  await kv.lset(PENDING_KEY, index, JSON.stringify(record));
}

async function handleAdmin(req, res) {
  if (!process.env.TRIBUTE_ADMIN_TOKEN) {
    return res.status(503).json({ success: false, error: 'TRIBUTE_ADMIN_TOKEN is not configured.' });
  }

  if (!adminAuthorized(req)) {
    return res.status(401).json({ success: false, error: 'Admin authorization required.' });
  }

  if (req.method === 'GET') {
    const records = await pendingRecords();
    const pending = records.filter((item) => item.status === 'pending').map(reviewRecord);
    return res.status(200).json({ success: true, pending, archived: records.length - pending.length });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const body = jsonBody(req);
  const action = clean(body.action, 20).toLowerCase();
  const id = clean(body.id, 100);
  if (!['approve', 'reject', 'edit'].includes(action) || !id) {
    return res.status(400).json({ success: false, error: 'A valid tribute id and moderation action are required.' });
  }

  const records = await pendingRecords();
  const index = records.findIndex((item) => item.id === id);
  if (index < 0) {
    return res.status(404).json({ success: false, error: 'Tribute not found.' });
  }

  const current = records[index];
  if (current.status !== 'pending') {
    return res.status(409).json({ success: false, error: 'This tribute has already been reviewed.' });
  }

  const now = new Date().toISOString();
  if (action === 'edit') {
    const author = clean(body.author, 60);
    const message = clean(body.message, 600);
    if (author.length < 2 || message.length < 10) {
      return res.status(400).json({ success: false, error: 'Edited name and message must be valid.' });
    }
    const edited = { ...current, author, message, updatedAt: now };
    await updatePendingAt(index, edited);
    return res.status(200).json({ success: true, tribute: reviewRecord(edited) });
  }

  if (action === 'approve') {
    const published = {
      ...current,
      status: 'published',
      publishedAt: now,
      moderatedAt: now
    };
    await kv.lpush(PUBLIC_KEY, JSON.stringify(published));
    await kv.ltrim(PUBLIC_KEY, 0, MAX_RECORDS - 1);
    await updatePendingAt(index, published);
    return res.status(200).json({ success: true, status: 'published', tribute: publicRecord(published) });
  }

  const rejected = {
    ...current,
    status: 'rejected',
    rejectedAt: now,
    moderatedAt: now
  };
  await kv.lpush(REJECTED_KEY, JSON.stringify(rejected));
  await kv.ltrim(REJECTED_KEY, 0, MAX_RECORDS - 1);
  await updatePendingAt(index, rejected);
  return res.status(200).json({ success: true, status: 'rejected' });
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();

  const isAdminRequest = req.query?.admin === '1' || new URL(req.url || '/', 'http://localhost').searchParams.get('admin') === '1';
  if (isAdminRequest) {
    res.setHeader('Cache-Control', 'no-store');
    try {
      return await handleAdmin(req, res);
    } catch (error) {
      console.warn('Tribute moderation unavailable:', error.message);
      return res.status(503).json({ success: false, error: 'Tribute moderation storage is not available.' });
    }
  }

  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

  if (req.method === 'GET') {
    try {
      const records = await kv.lrange(PUBLIC_KEY, 0, 99);
      const tributes = (records || [])
        .map(parseItem)
        .filter((item) => item && item.message && item.author)
        .map(publicRecord);
      return res.status(200).json({ success: true, tributes });
    } catch (error) {
      console.warn('Tribute public list unavailable:', error.message);
      return res.status(200).json({ success: false, tributes: [] });
    }
  }

  if (req.method === 'POST') {
    const body = jsonBody(req);
    const name = clean(body.name, 60);
    const message = clean(body.message, 600);
    if (name.length < 2 || message.length < 10) {
      return res.status(400).json({ success: false, error: 'Please provide a name and a message of at least 10 characters.' });
    }

    try {
      await kv.lpush(PENDING_KEY, JSON.stringify({
        id: `tribute-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        author: name,
        message,
        kind: 'NEW VOICE',
        status: 'pending',
        submittedAt: new Date().toISOString()
      }));
      await kv.ltrim(PENDING_KEY, 0, MAX_RECORDS - 1);
      return res.status(202).json({ success: true, status: 'pending' });
    } catch (error) {
      console.warn('Tribute submission unavailable:', error.message);
      return res.status(503).json({ success: false, error: 'Tribute storage is not available yet.' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}
