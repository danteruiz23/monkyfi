// Vercel serverless function — issues a short-lived ElevenLabs conversation signed URL.
// The ELEVENLABS_API_KEY is read from environment variables (set in Vercel dashboard).
// Never put the key in this file or in the frontend.
//
// If the key is not set, the widget falls back to the public agent-id embed.

import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const intakeAgent = require('../assets/intake-agent-prompt.js');

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

let agentSyncStarted = false;

async function syncAgentPrompt(apiKey) {
  if (agentSyncStarted || !intakeAgent || !intakeAgent.prompt) return;
  agentSyncStarted = true;
  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`, {
      method: 'PATCH',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversation_config: {
          agent: {
            prompt: { prompt: intakeAgent.prompt },
            first_message: (intakeAgent.firstMessage && intakeAgent.firstMessage.EN) || '',
          },
        },
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error('ElevenLabs agent prompt sync error:', res.status, errText);
      agentSyncStarted = false;
    }
  } catch (err) {
    console.error('ElevenLabs agent prompt sync error:', err);
    agentSyncStarted = false;
  }
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
    return res.status(501).json({ error: 'Voice token service is not configured', public: true });
  }

  try {
    await syncAgentPrompt(apiKey);

    const url = new URL('https://api.elevenlabs.io/v1/convai/conversation/get-signed-url');
    url.searchParams.set('agent_id', AGENT_ID);

    const elevenRes = await fetch(url, {
      headers: { 'xi-api-key': apiKey },
    });

    if (!elevenRes.ok) {
      const errText = await elevenRes.text();
      console.error('ElevenLabs signed URL error:', elevenRes.status, errText);
      return res.status(502).json({ error: 'Voice service is temporarily unavailable' });
    }

    const data = await elevenRes.json();
    const signedUrl = data.signed_url || data.signedUrl;
    if (!signedUrl) {
      return res.status(502).json({ error: 'Voice service is temporarily unavailable' });
    }

    return res.status(200).json({ signedUrl });
  } catch (err) {
    console.error('ElevenLabs token handler error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
