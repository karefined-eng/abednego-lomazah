import { kv } from '@vercel/kv';

const PUBLIC_KEY = 'everlasting_tributes_public';
const PENDING_KEY = 'everlasting_tributes_pending';

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

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

  if (req.method === 'GET') {
    try {
      const records = await kv.lrange(PUBLIC_KEY, 0, 99);
      const tributes = (records || [])
        .map(parseItem)
        .filter((item) => item && item.message && item.author)
        .map((item) => ({
          message: clean(item.message, 600),
          author: clean(item.author, 60),
          kind: clean(item.kind || 'FROM THE WALL', 32)
        }));
      return res.status(200).json({ success: true, tributes });
    } catch (error) {
      console.warn('Tribute public list unavailable:', error.message);
      return res.status(200).json({ success: false, tributes: [] });
    }
  }

  if (req.method === 'POST') {
    const name = clean(req.body?.name, 60);
    const message = clean(req.body?.message, 600);
    if (name.length < 2 || message.length < 10) {
      return res.status(400).json({ success: false, error: 'Please provide a name and a message of at least 10 characters.' });
    }

    try {
      await kv.lpush(PENDING_KEY, JSON.stringify({
        id: `tribute-${Date.now()}`,
        author: name,
        message,
        kind: 'NEW VOICE',
        status: 'pending',
        submittedAt: new Date().toISOString()
      }));
      return res.status(202).json({ success: true, status: 'pending' });
    } catch (error) {
      console.warn('Tribute submission unavailable:', error.message);
      return res.status(503).json({ success: false, error: 'Tribute storage is not available yet.' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}
