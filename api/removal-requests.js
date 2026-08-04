const fs = require('fs');
const path = require('path');

// Minimal CSV-only implementation: append to data/removal-requests.csv

module.exports = async function (req, res) {
  // Allow CORS for simple deployments; tighten in production.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end('Method not allowed');
  }

  let body = '';
  try {
    body = typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');
  } catch (err) {
    res.statusCode = 400;
    return res.end('Invalid JSON');
  }

  const { requesterName, contentUrl, description, images, additionalInfo, honeypot, timestamp, userAgent, referer } = body;

  // Silent success for spambots
  if (honeypot) {
    res.statusCode = 200;
    return res.json({ ok: true });
  }

  if (!requesterName || !contentUrl || !description) {
    res.statusCode = 400;
    return res.json({ ok: false, error: 'Missing required fields' });
  }

  const now = timestamp || new Date().toISOString();

  // CSV local disk append
  const csvDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(csvDir)) {
    try { fs.mkdirSync(csvDir, { recursive: true }); } catch (e) {}
  }

  const csvPath = path.join(csvDir, 'removal-requests.csv');
  const escape = (v) => '"' + String(v || '').replace(/"/g, '""').replace(/\r?\n/g, ' ') + '"';
  const row = [requesterName, contentUrl, description, images || '', additionalInfo || '', now, userAgent || '', referer || ''].map(escape).join(',') + '\n';

  try {
    if (!fs.existsSync(csvPath)) {
      const header = 'Name,Content URL,Description,Images,Additional,Timestamp,UserAgent,Referer\n';
      fs.writeFileSync(csvPath, header, { encoding: 'utf8' });
    }
    fs.appendFileSync(csvPath, row, { encoding: 'utf8' });
  } catch (err) {
    console.error('Failed to write CSV', err);
    res.statusCode = 500;
    return res.json({ ok: false, error: 'Failed to record request' });
  }

  return res.json({ ok: true, stored: 'csv' });
};
