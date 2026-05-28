// Vercel serverless function — proxies chat requests to Anthropic's API.
// The ANTHROPIC_API_KEY is read from environment variables (set in Vercel dashboard).
// Never put the key in this file or in the frontend.

export default async function handler(req, res) {
  // Basic CORS — allows requests from your own domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY env var is not set');
    return res.status(500).json({ error: 'Server misconfigured: missing API key' });
  }

  try {
    const { messages, system } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
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
        system: system || undefined,
        messages: messages
      })
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error('Anthropic API error:', anthropicRes.status, errText);
      return res.status(502).json({ error: 'AI service error', detail: errText });
    }

    const data = await anthropicRes.json();
    const text = (data.content && data.content[0] && data.content[0].text) || '';
    return res.status(200).json({ text });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Server error', detail: String(err) });
  }
}
