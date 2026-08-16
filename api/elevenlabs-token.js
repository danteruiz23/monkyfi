// Vercel serverless function — issues a short-lived ElevenLabs conversation signed URL
// and writes the Intake Monkyfi prompt onto the agent (not a client override).
// The ELEVENLABS_API_KEY is read from environment variables (set in Vercel dashboard).
// Never put the key in this file or in the frontend.

import { INTAKE_FIRST_MESSAGE, INTAKE_PROMPT } from '../lib/intake-prompt.js';

const AGENT_ID = process.env.ELEVENLABS_AGENT_ID || 'agent_8801m05ndkpyfanva562vsc3ss9j';

const ALLOWED_ORIGINS = [
  'https://monkyfi.com',
  'https://www.monkyfi.com',
  'https://monkyfi.ai',
  'https://www.monkyfi.ai',
];

function getAllowedOrigin(req) {
  const origin = req.headers?.origin || '';
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  if (/^https:\/\/[\w-]+-danteruiz23s-projects\.vercel\.app$/.test(origin)) return origin;
  return null;
}

const rateMap = new Map();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 10;

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

let promptSynced = false;

async function syncAgentPrompt(apiKey) {
  if (promptSynced) return true;
  const res = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`, {
    method: 'PATCH',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Intake Monkyfi',
      conversation_config: {
        agent: {
          first_message: INTAKE_FIRST_MESSAGE.ES,
          prompt: {
            prompt: INTAKE_PROMPT,
            temperature: 0.2,
          },
        },
      },
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    console.error('ElevenLabs agent prompt sync error:', res.status, errText);
    return false;
  }
  promptSynced = true;
  return true;
}

export default async function handler(req, res) {
  const origin = getAllowedOrigin(req);
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return res.status(501).json({ error: 'Voice token service is not configured', public: true, promptSynced: false });
  }

  try {
    const synced = await syncAgentPrompt(apiKey);

    const url = new URL('https://api.elevenlabs.io/v1/convai/conversation/get-signed-url');
    url.searchParams.set('agent_id', AGENT_ID);

    const elevenRes = await fetch(url, {
      headers: { 'xi-api-key': apiKey },
    });

    if (!elevenRes.ok) {
      const errText = await elevenRes.text();
      console.error('ElevenLabs signed URL error:', elevenRes.status, errText);
      return res.status(502).json({ error: 'Voice service is temporarily unavailable', promptSynced: synced });
    }

    const data = await elevenRes.json();
    const signedUrl = data.signed_url || data.signedUrl;
    if (!signedUrl) {
      return res.status(502).json({ error: 'Voice service is temporarily unavailable', promptSynced: synced });
    }

    return res.status(200).json({ signedUrl, promptSynced: synced });
  } catch (err) {
    console.error('ElevenLabs token handler error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
