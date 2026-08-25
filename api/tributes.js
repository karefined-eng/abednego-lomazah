import { kv } from '@vercel/kv';

const PUBLIC_KEY = 'everlasting_tributes_public';
const PENDING_KEY = 'everlasting_tributes_pending';
const REJECTED_KEY = 'everlasting_tributes_rejected';
const ARCHIVE_INDEX_KEY = 'everlasting_tributes_archive_ids';
const ARCHIVE_RECORD_PREFIX = 'everlasting_tribute_record:';
const ARCHIVE_SEEDED_KEY = 'everlasting_tributes_archive_seeded_v1';
const MAX_RECORDS = 10000;
const PUBLIC_DISPLAY_RECORDS = 100;
const ARCHIVE_READ_BATCH = 200;

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
    moderatedAt: clean(item.moderatedAt, 40),
    publishedAt: clean(item.publishedAt, 40),
    rejectedAt: clean(item.rejectedAt, 40)
  };
}

async function listRecords(key) {
  const records = await kv.lrange(key, 0, MAX_RECORDS - 1);
  return (records || []).map(parseItem).filter((item) => item && item.id && item.message && item.author);
}

async function pendingRecords() {
  return listRecords(PENDING_KEY);
}

function archiveKey(id) {
  return `${ARCHIVE_RECORD_PREFIX}${id}`;
}

async function archiveRecords(status = '') {
  const ids = await kv.lrange(ARCHIVE_INDEX_KEY, 0, MAX_RECORDS - 1);
  const validIds = (ids || []).map((id) => String(id || '').trim()).filter(Boolean);
  const records = [];

  for (let start = 0; start < validIds.length; start += ARCHIVE_READ_BATCH) {
    const batchIds = validIds.slice(start, start + ARCHIVE_READ_BATCH);
    const values = await kv.mget(...batchIds.map(archiveKey));
    values.forEach((value) => {
      const item = parseItem(value);
      if (item && item.id && item.message && item.author && (!status || item.status === status)) {
        records.push(item);
      }
    });
  }

  return records;
}

async function saveArchiveRecord(record, addToIndex = false) {
  await kv.set(archiveKey(record.id), JSON.stringify(record));
  if (addToIndex) {
    await kv.lpush(ARCHIVE_INDEX_KEY, record.id);
    await kv.ltrim(ARCHIVE_INDEX_KEY, 0, MAX_RECORDS - 1);
  }
}

async function ensureArchiveSeeded() {
  if (await kv.get(ARCHIVE_SEEDED_KEY)) return;

  const [pending, published, rejected] = await Promise.all([
    listRecords(PENDING_KEY),
    listRecords(PUBLIC_KEY),
    listRecords(REJECTED_KEY)
  ]);
  const byId = new Map();
  [...pending, ...published, ...rejected].forEach((record) => {
    if (record?.id) byId.set(record.id, record);
  });
  const records = Array.from(byId.values()).slice(0, MAX_RECORDS);

  for (const record of records) {
    await saveArchiveRecord(record);
  }
  if (records.length) {
    await kv.del(ARCHIVE_INDEX_KEY);
    await kv.rpush(ARCHIVE_INDEX_KEY, ...records.map((record) => record.id));
    await kv.ltrim(ARCHIVE_INDEX_KEY, 0, MAX_RECORDS - 1);
  }
  await kv.set(ARCHIVE_SEEDED_KEY, new Date().toISOString());
}

function csvCell(value) {
  return `"${String(value || '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
}

function recordsCsv(records) {
  const columns = ['id', 'author', 'message', 'kind', 'status', 'submittedAt', 'updatedAt', 'moderatedAt', 'publishedAt', 'rejectedAt'];
  const rows = records.map((record) => {
    const item = reviewRecord(record);
    return columns.map((column) => csvCell(item[column])).join(',');
  });
  return [columns.join(','), ...rows].join('\n');
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

  await ensureArchiveSeeded();

  if (req.method === 'GET') {
    const exportFormat = String(req.query?.format || '').toLowerCase();
    const exportScope = String(req.query?.export || '').toLowerCase();
    if (exportScope === 'approved' || exportScope === 'all') {
      const records = await archiveRecords(exportScope === 'approved' ? 'published' : '');
      if (exportFormat === 'csv') {
        const filename = exportScope === 'approved'
          ? 'abednego-lomazah-approved-tributes.csv'
          : 'abednego-lomazah-all-tributes.csv';
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.status(200).send(recordsCsv(records));
      }
      const filename = exportScope === 'approved'
        ? 'abednego-lomazah-approved-tributes.json'
        : 'abednego-lomazah-all-tributes.json';
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).json({
        success: true,
        exportedAt: new Date().toISOString(),
        count: records.length,
        records: records.map(reviewRecord)
      });
    }

    const records = await pendingRecords();
    const pending = records.filter((item) => item.status === 'pending').map(reviewRecord);
    const archiveIds = await kv.lrange(ARCHIVE_INDEX_KEY, 0, MAX_RECORDS - 1);
    return res.status(200).json({
      success: true,
      pending,
      archived: records.length - pending.length,
      archiveCount: (archiveIds || []).length,
      archiveLimit: MAX_RECORDS
    });
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
    await saveArchiveRecord(edited);
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
    await saveArchiveRecord(published);
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
  await saveArchiveRecord(rejected);
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
      const records = await kv.lrange(PUBLIC_KEY, 0, PUBLIC_DISPLAY_RECORDS - 1);
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
      await ensureArchiveSeeded();
      const record = {
        id: `tribute-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        author: name,
        message,
        kind: 'NEW VOICE',
        status: 'pending',
        submittedAt: new Date().toISOString()
      };
      await saveArchiveRecord(record, true);
      await kv.lpush(PENDING_KEY, JSON.stringify(record));
      await kv.ltrim(PENDING_KEY, 0, MAX_RECORDS - 1);
      return res.status(202).json({ success: true, status: 'pending' });
    } catch (error) {
      console.warn('Tribute submission unavailable:', error.message);
      return res.status(503).json({ success: false, error: 'Tribute storage is not available yet.' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}
