// api/updates.js
// Vercel Serverless Function to fetch live WhatsApp channel updates from Vercel KV

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Allow GET requests from website frontend
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const rawList = await kv.lrange('channel_updates', 0, 49);
    const allowedCategories = new Set(['INITIATIVE', 'DATE TO BE ANNOUNCED']);
    const parsedUpdates = (rawList || []).flatMap((item) => {
      try {
        const parsed = typeof item === 'string' ? JSON.parse(item) : item;
        const category = String(parsed?.category || '').trim().toUpperCase();
        return allowedCategories.has(category) ? [{ ...parsed, category }] : [];
      } catch {
        return [];
      }
    });

    // Purge legacy advocacy/how-to records from the active app database.
    if (parsedUpdates.length !== (rawList || []).length) {
      await kv.del('channel_updates');
      if (parsedUpdates.length) {
        await kv.rpush('channel_updates', ...parsedUpdates.map((item) => JSON.stringify(item)));
      }
    }
    const updates = parsedUpdates;

    // Cache responses for 60 seconds on CDN
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

    return res.status(200).json({
      success: true,
      count: updates.length,
      updates: updates
    });
  } catch (error) {
    console.warn('Vercel KV fetch error (database may not be provisioned yet):', error.message);
    return res.status(200).json({
      success: false,
      count: 0,
      updates: [],
      error: 'Campaign story data is not configured yet'
    });
  }
}
