// Vercel serverless function — proxies chat requests to Anthropic's API.
// The ANTHROPIC_API_KEY is read from environment variables (set in Vercel dashboard).
// Never put the key in this file or in the frontend.

// --- Allowed origins (restrict CORS to your own domains) ---
const ALLOWED_ORIGINS = [
  'https://monkyfi.com',
  'https://www.monkyfi.com',
  'https://monkyfi.ai',
  'https://www.monkyfi.ai',
];

function getAllowedOrigin(req) {
  const origin = req.headers?.origin || '';
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  // Allow Vercel preview deployments
  if (/^https:\/\/[\w-]+-danteruiz23s-projects\.vercel\.app$/.test(origin)) return origin;
  return null;
}

// --- Simple in-memory rate limiter (per serverless instance) ---
const rateMap = new Map();
const RATE_WINDOW_MS = 60_000; // 1 minute
const RATE_MAX = 20;           // max requests per window per IP

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

// --- Server-side system prompt (not sent from the client) ---
const SYSTEM_PROMPT = `You are the Monkyfi AI — the assistant on monkyfi.ai, the website of a boutique US-LATAM telecom + AI consultancy founded by Dante, a 20+ year subsea/NOC veteran based in Miami. Tagline: "Get AI Power."

Three product lines:
1. MONKYFI CONNECT — Fractional Service Delivery Manager / Solutions Architect for US-LATAM enterprise circuits.
2. MONKYFI ATLAS — Productized AI-NOC modernization for LATAM Tier-2/3 CSPs (Cirion, IFX, ufinet, ETB, Algar, Megacable, Entel etc.).
3. MONKYFI SENTINEL — SaaS for real-time subsea cable event alerting, AI impact briefings, resilience scorecards. For US-LATAM fintechs, ISPs, hyperscaler partners.

Dante's edge: hands-on operations of the major US-LATAM subsea ring (25,000 km, 16 landing stations, 20 Tbps) + Telxius/Telefónica background. Native Spanish, Miami-based (NAP of the Americas).

Tone: confident, warm, technical when it serves, never salesy. Reply in 2-4 short paragraphs unless asked for detail. Use line breaks. If a question is off-topic, gently bring it back. If someone asks to book, tell them to email dante@monkyfi.com or hello@monkyfi.com, or use the "Book a call" button.`;

// --- Max allowed messages per request (prevent abuse) ---
const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 2000;

export default async function handler(req, res) {
  // CORS — only allow known origins
  const origin = getAllowedOrigin(req);
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY env var is not set');
    return res.status(500).json({ error: 'Service temporarily unavailable' });
  }

  try {
    const { messages } = req.body || {};

    // Validate messages array
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    if (messages.length > MAX_MESSAGES) {
      return res.status(400).json({ error: 'Too many messages in conversation' });
    }

    // Validate each message has the expected shape
    const sanitized = messages.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: typeof m.content === 'string'
        ? m.content.slice(0, MAX_MESSAGE_LENGTH)
        : '',
    })).filter(m => m.content.length > 0);

    if (sanitized.length === 0) {
      return res.status(400).json({ error: 'No valid messages provided' });
    }

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: sanitized
      })
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error('Anthropic API error:', anthropicRes.status, errText);
      return res.status(502).json({ error: 'AI service is temporarily unavailable' });
    }

    const data = await anthropicRes.json();
    const text = (data.content && data.content[0] && data.content[0].text) || '';
    return res.status(200).json({ text });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
