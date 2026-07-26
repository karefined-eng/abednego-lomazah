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
    const updates = (rawList || []).map((item) => (typeof item === 'string' ? JSON.parse(item) : item));

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
      error: 'Vercel KV not configured yet'
    });
  }
}
