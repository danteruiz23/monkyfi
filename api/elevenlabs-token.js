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

function sanitizeKey(raw) {
  if (!raw) return '';
  return String(raw).replace(/^\uFEFF/, '').trim().replace(/^['"]+|['"]+$/g, '').trim();
}

function classifyElevenLabsError(status, errText) {
  let code = 'elevenlabs_error';
  if (status === 401) code = 'unauthorized';
  else if (status === 403) code = 'forbidden';
  else if (status === 404) code = 'agent_not_found';
  const text = String(errText || '');
  try {
    const parsed = JSON.parse(text);
    const detail = parsed && parsed.detail;
    const nested = detail && typeof detail === 'object' ? detail.code : null;
    if (typeof nested === 'string' && nested.length < 64) code = nested;
  } catch (_) {
    /* keep status-based code */
  }
  if (/not (?:set up|configured) for authentication|does not require authorization|signed url/i.test(text)) {
    code = 'signed_url_not_required';
  }
  return { elevenlabsStatus: status, code };
}

let promptSynced = false;

async function patchAgent(apiKey, body) {
  const res = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`, {
    method: 'PATCH',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text();
    console.error('ElevenLabs agent PATCH error:', res.status, errText);
    return false;
  }
  return true;
}

async function syncAgentPrompt(apiKey) {
  if (promptSynced) return true;

  const promptBodies = [
    {
      name: 'Intake Monkyfi',
      conversation_config: {
        agent: {
          first_message: INTAKE_FIRST_MESSAGE.ES,
          prompt: { prompt: INTAKE_PROMPT, temperature: 0.1, knowledge_base: [] },
        },
      },
    },
    {
      name: 'Intake Monkyfi',
      conversation_config: {
        agent: {
          first_message: INTAKE_FIRST_MESSAGE.ES,
          prompt: { prompt: INTAKE_PROMPT, temperature: 0.1 },
        },
      },
    },
    {
      conversation_config: {
        agent: {
          first_message: INTAKE_FIRST_MESSAGE.ES,
          prompt: { prompt: INTAKE_PROMPT },
        },
      },
    },
  ];

  let promptOk = false;
  for (const body of promptBodies) {
    if (await patchAgent(apiKey, body)) {
      promptOk = true;
      break;
    }
  }
  if (!promptOk) return false;

  const guardrailBodies = [
    {
      platform_settings: {
        guardrails: {
          version: '1',
          focus: { is_enabled: true },
          prompt_injection: { is_enabled: true },
        },
      },
    },
    {
      platform_settings: {
        guardrails: {
          version: '1',
          focus: { isEnabled: true },
          prompt_injection: { isEnabled: true },
        },
      },
    },
  ];
  for (const body of guardrailBodies) {
    if (await patchAgent(apiKey, body)) break;
  }

  promptSynced = true;
  return true;
}

async function probeAgent(apiKey) {
  const res = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`, {
    headers: { 'xi-api-key': apiKey },
  });
  if (!res.ok) {
    const errText = await res.text();
    console.error('ElevenLabs agent GET error:', res.status, errText);
    return { ok: false, ...classifyElevenLabsError(res.status, errText) };
  }
  return { ok: true, elevenlabsStatus: 200, code: 'ok' };
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

  const apiKey = sanitizeKey(process.env.ELEVENLABS_API_KEY);
  if (!apiKey) {
    return res.status(501).json({ error: 'Voice token service is not configured', public: true, promptSynced: false, code: 'missing_key' });
  }

  try {
    const probe = await probeAgent(apiKey);
    if (!probe.ok) {
      return res.status(502).json({
        error: 'Voice service is temporarily unavailable',
        promptSynced: false,
        code: probe.code,
        elevenlabsStatus: probe.elevenlabsStatus,
      });
    }

    const synced = await syncAgentPrompt(apiKey);

    const url = new URL('https://api.elevenlabs.io/v1/convai/conversation/get-signed-url');
    url.searchParams.set('agent_id', AGENT_ID);

    const elevenRes = await fetch(url, {
      headers: { 'xi-api-key': apiKey },
    });

    if (!elevenRes.ok) {
      const errText = await elevenRes.text();
      console.error('ElevenLabs signed URL error:', elevenRes.status, errText);
      const classified = classifyElevenLabsError(elevenRes.status, errText);
      if (classified.code === 'signed_url_not_required' && synced) {
        return res.status(200).json({ publicAgent: true, promptSynced: true, code: classified.code });
      }
      return res.status(502).json({
        error: 'Voice service is temporarily unavailable',
        promptSynced: synced,
        code: classified.code,
        elevenlabsStatus: classified.elevenlabsStatus,
      });
    }

    const data = await elevenRes.json();
    const signedUrl = data.signed_url || data.signedUrl;
    if (!signedUrl) {
      return res.status(502).json({ error: 'Voice service is temporarily unavailable', promptSynced: synced, code: 'missing_signed_url' });
    }

    return res.status(200).json({ signedUrl, promptSynced: synced, code: synced ? 'ok' : 'prompt_sync_failed' });
  } catch (err) {
    console.error('ElevenLabs token handler error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.', code: 'handler_error' });
  }
}
