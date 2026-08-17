// Receives completed Connect intake from the ElevenLabs voice agent (server tool)
// and forwards it to Web3Forms — same inbox as the website form.
// Optional: set INTAKE_TOOL_SECRET and send it as header x-monkyfi-intake-key.

const WEB3FORMS_KEY = '645f7dca-b0f1-4469-9541-83dc7a825ec7';

const rateMap = new Map();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 8;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW_MS) {
    rateMap.set(ip, { start: now, count: 1 });
    return false;
  }
  entry.count++;
  return entry.count > RATE_MAX;
}

function str(v, max) {
  return String(v == null ? '' : v).trim().slice(0, max || 500);
}

function emailOk(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

function looksLikeIdentityDump(body) {
  const blob = JSON.stringify(body || {}).toLowerCase();
  return /date_of_birth|fecha_de_nacimiento|passport|ssn|national_id|password|cpni/.test(blob);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-monkyfi-intake-key');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ ok: false, error: 'Too many requests' });
  }

  const expectedSecret = str(process.env.INTAKE_TOOL_SECRET, 200);
  if (expectedSecret) {
    const got = str(req.headers['x-monkyfi-intake-key'], 200);
    if (got !== expectedSecret) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  if (looksLikeIdentityDump(body)) {
    return res.status(400).json({
      ok: false,
      error: 'Do not send date of birth, government IDs, passwords, or end-customer PII.',
    });
  }

  const name = str(body.name, 120);
  const email = str(body.email, 180).toLowerCase();
  const phone = str(body.phone, 40);
  const company = str(body.company, 160);
  const operationType = str(body.operation_type || body.segment, 120);
  const companySize = str(body.company_size || body.size, 120);
  const pain = str(body.operational_pain || body.issue, 400);
  const services = str(body.services || body.interests, 400);
  const situation = str(body.situation, 800);

  if (!name || !email || !company) {
    return res.status(400).json({
      ok: false,
      error: 'name, email, and company are required before submitting intake.',
    });
  }
  if (!emailOk(email)) {
    return res.status(400).json({ ok: false, error: 'email must be a valid work email address.' });
  }

  const message = [
    'New AI Assessment request from Intake Monkyfi (voice)',
    '',
    'Company: ' + company,
    'Operation type: ' + (operationType || '(not specified)'),
    'Company size: ' + (companySize || '(not specified)'),
    'Biggest issue: ' + (pain || '(not specified)'),
    'Phone: ' + (phone || '(not provided)'),
    'Interested in: ' + (services || '(not specified)'),
    situation ? 'Situation: ' + situation : '',
  ].filter(Boolean).join('\n');

  try {
    const web3 = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: 'New AI Assessment Request — Monkyfi Connect (Voice)',
        from_name: 'Intake Monkyfi Voice',
        name,
        email,
        phone: phone || '(not provided)',
        company,
        segment: operationType || '(not specified)',
        size: companySize || '(not specified)',
        issue: pain || '(not specified)',
        interests: services || '(not specified)',
        situation: situation || '',
        message,
      }),
    });
    const data = await web3.json().catch(() => ({}));
    if (!web3.ok || !data.success) {
      console.error('Web3Forms intake forward error:', web3.status, data);
      return res.status(502).json({ ok: false, error: 'Could not deliver intake just now. Ask them to email hello@monkyfi.com.' });
    }
  } catch (err) {
    console.error('intake handler error:', err);
    return res.status(502).json({ ok: false, error: 'Could not deliver intake just now. Ask them to email hello@monkyfi.com.' });
  }

  return res.status(200).json({
    ok: true,
    message: 'Intake received. Dante will follow up at ' + email + ' within 24 hours.',
  });
}
