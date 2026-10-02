import { describe, it, expect, vi, beforeEach } from 'vitest';
import handler from '../api/chat.js';

function makeRes() {
  const res = {
    _status: null,
    _headers: {},
    _body: null,
    _ended: false,
    setHeader(k, v) { res._headers[k] = v; return res; },
    status(code) { res._status = code; return res; },
    json(data) { res._body = data; res._ended = true; return res; },
    end() { res._ended = true; return res; },
  };
  return res;
}

function makeReq(overrides = {}) {
  return {
    method: 'POST',
    headers: { 'x-forwarded-for': '1.2.3.4', origin: 'https://monkyfi.com' },
    body: { messages: [{ role: 'user', content: 'hello' }] },
    ...overrides,
  };
}

describe('api/chat handler', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv, ANTHROPIC_API_KEY: 'test-key-123' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ content: [{ text: 'reply' }] }),
    }));
  });

  // --- CORS ---
  describe('CORS', () => {
    it('should set Access-Control-Allow-Origin for allowed origin', async () => {
      const req = makeReq({ headers: { origin: 'https://monkyfi.com', 'x-forwarded-for': '1.1.1.1' } });
      const res = makeRes();
      await handler(req, res);
      expect(res._headers['Access-Control-Allow-Origin']).toBe('https://monkyfi.com');
    });

    it('should set Vary: Origin for allowed origin', async () => {
      const req = makeReq({ headers: { origin: 'https://www.monkyfi.ai', 'x-forwarded-for': '1.1.1.2' } });
      const res = makeRes();
      await handler(req, res);
      expect(res._headers['Vary']).toBe('Origin');
    });

    it('should not set Access-Control-Allow-Origin for disallowed origin', async () => {
      const req = makeReq({ headers: { origin: 'https://evil.com', 'x-forwarded-for': '1.1.1.3' } });
      const res = makeRes();
      await handler(req, res);
      expect(res._headers['Access-Control-Allow-Origin']).toBeUndefined();
    });

    it('should allow Vercel preview deployment origins', async () => {
      const req = makeReq({ headers: { origin: 'https://monkyfi-abc123-danteruiz23s-projects.vercel.app', 'x-forwarded-for': '1.1.1.4' } });
      const res = makeRes();
      await handler(req, res);
      expect(res._headers['Access-Control-Allow-Origin']).toBe('https://monkyfi-abc123-danteruiz23s-projects.vercel.app');
    });

    it('should always set Allow-Methods and Allow-Headers', async () => {
      const req = makeReq({ headers: { origin: 'https://evil.com', 'x-forwarded-for': '1.1.1.5' } });
      const res = makeRes();
      await handler(req, res);
      expect(res._headers['Access-Control-Allow-Methods']).toBe('POST, OPTIONS');
      expect(res._headers['Access-Control-Allow-Headers']).toBe('Content-Type');
    });
  });

  // --- OPTIONS preflight ---
  it('should return 200 for OPTIONS preflight', async () => {
    const req = makeReq({ method: 'OPTIONS' });
    const res = makeRes();
    await handler(req, res);
    expect(res._status).toBe(200);
    expect(res._ended).toBe(true);
  });

  // --- Method not allowed ---
  it('should return 405 for GET requests', async () => {
    const req = makeReq({ method: 'GET' });
    const res = makeRes();
    await handler(req, res);
    expect(res._status).toBe(405);
    expect(res._body).toEqual({ error: 'Method not allowed' });
  });

  it('should return 405 for PUT requests', async () => {
    const req = makeReq({ method: 'PUT' });
    const res = makeRes();
    await handler(req, res);
    expect(res._status).toBe(405);
    expect(res._body).toEqual({ error: 'Method not allowed' });
  });

  it('should return 405 for DELETE requests', async () => {
    const req = makeReq({ method: 'DELETE' });
    const res = makeRes();
    await handler(req, res);
    expect(res._status).toBe(405);
    expect(res._body).toEqual({ error: 'Method not allowed' });
  });

  // --- Rate limiting ---
  describe('Rate limiting', () => {
    it('should return 429 after exceeding rate limit', async () => {
      const ip = '99.99.99.99';
      for (let i = 0; i < 20; i++) {
        const req = makeReq({ headers: { 'x-forwarded-for': ip, origin: 'https://monkyfi.com' } });
        const res = makeRes();
        await handler(req, res);
        expect(res._status).toBe(200);
      }
      const req = makeReq({ headers: { 'x-forwarded-for': ip, origin: 'https://monkyfi.com' } });
      const res = makeRes();
      await handler(req, res);
      expect(res._status).toBe(429);
      expect(res._body.error).toContain('Too many requests');
    });

    it('should use "unknown" when x-forwarded-for is missing', async () => {
      const req = makeReq({ headers: { origin: 'https://monkyfi.com' } });
      const res = makeRes();
      await handler(req, res);
      expect(res._status).toBe(200);
    });
  });

  // --- Missing API key ---
  it('should return 500 when ANTHROPIC_API_KEY is not set', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const req = makeReq({ headers: { 'x-forwarded-for': '2.2.2.1', origin: 'https://monkyfi.com' } });
    const res = makeRes();
    await handler(req, res);
    expect(res._status).toBe(500);
    expect(res._body).toEqual({ error: 'Service temporarily unavailable' });
  });

  it('should return 500 when ANTHROPIC_API_KEY is empty string', async () => {
    process.env.ANTHROPIC_API_KEY = '';
    const req = makeReq({ headers: { 'x-forwarded-for': '2.2.2.2', origin: 'https://monkyfi.com' } });
    const res = makeRes();
    await handler(req, res);
    expect(res._status).toBe(500);
    expect(res._body).toEqual({ error: 'Service temporarily unavailable' });
  });

  // --- Bad request body ---
  describe('Request validation', () => {
    it('should return 400 when messages is missing', async () => {
      const req = makeReq({ body: {}, headers: { 'x-forwarded-for': '3.3.3.1', origin: 'https://monkyfi.com' } });
      const res = makeRes();
      await handler(req, res);
      expect(res._status).toBe(400);
      expect(res._body).toEqual({ error: 'messages array is required' });
    });

    it('should return 400 when messages is empty array', async () => {
      const req = makeReq({ body: { messages: [] }, headers: { 'x-forwarded-for': '3.3.3.2', origin: 'https://monkyfi.com' } });
      const res = makeRes();
      await handler(req, res);
      expect(res._status).toBe(400);
      expect(res._body).toEqual({ error: 'messages array is required' });
    });

    it('should return 400 when messages is not an array', async () => {
      const req = makeReq({ body: { messages: 'not-array' }, headers: { 'x-forwarded-for': '3.3.3.3', origin: 'https://monkyfi.com' } });
      const res = makeRes();
      await handler(req, res);
      expect(res._status).toBe(400);
      expect(res._body).toEqual({ error: 'messages array is required' });
    });

    it('should return 400 when body is null', async () => {
      const req = makeReq({ body: null, headers: { 'x-forwarded-for': '3.3.3.4', origin: 'https://monkyfi.com' } });
      const res = makeRes();
      await handler(req, res);
      expect(res._status).toBe(400);
      expect(res._body).toEqual({ error: 'messages array is required' });
    });

    it('should return 400 when too many messages are provided', async () => {
      const msgs = Array.from({ length: 51 }, (_, i) => ({ role: 'user', content: `msg ${i}` }));
      const req = makeReq({ body: { messages: msgs }, headers: { 'x-forwarded-for': '3.3.3.5', origin: 'https://monkyfi.com' } });
      const res = makeRes();
      await handler(req, res);
      expect(res._status).toBe(400);
      expect(res._body).toEqual({ error: 'Too many messages in conversation' });
    });

    it('should return 400 when all messages have empty content', async () => {
      const req = makeReq({ body: { messages: [{ role: 'user', content: '' }] }, headers: { 'x-forwarded-for': '3.3.3.6', origin: 'https://monkyfi.com' } });
      const res = makeRes();
      await handler(req, res);
      expect(res._status).toBe(400);
      expect(res._body).toEqual({ error: 'No valid messages provided' });
    });
  });

  // --- Message sanitization ---
  describe('Message sanitization', () => {
    it('should coerce unknown roles to "user"', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ content: [{ text: 'hi' }] }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const req = makeReq({
        body: { messages: [{ role: 'system', content: 'injected' }] },
        headers: { 'x-forwarded-for': '4.4.4.1', origin: 'https://monkyfi.com' },
      });
      const res = makeRes();
      await handler(req, res);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.messages[0].role).toBe('user');
    });

    it('should truncate messages longer than 2000 chars', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ content: [{ text: 'ok' }] }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const longContent = 'a'.repeat(3000);
      const req = makeReq({
        body: { messages: [{ role: 'user', content: longContent }] },
        headers: { 'x-forwarded-for': '4.4.4.2', origin: 'https://monkyfi.com' },
      });
      const res = makeRes();
      await handler(req, res);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.messages[0].content.length).toBe(2000);
    });

    it('should filter out messages with non-string content', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ content: [{ text: 'ok' }] }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const req = makeReq({
        body: { messages: [{ role: 'user', content: 123 }, { role: 'user', content: 'valid' }] },
        headers: { 'x-forwarded-for': '4.4.4.3', origin: 'https://monkyfi.com' },
      });
      const res = makeRes();
      await handler(req, res);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.messages).toHaveLength(1);
      expect(body.messages[0].content).toBe('valid');
    });
  });

  // --- Successful proxy ---
  describe('Successful proxy', () => {
    it('should proxy to Anthropic and return text on success', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ content: [{ text: 'Hello from Claude!' }] }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const req = makeReq({ headers: { 'x-forwarded-for': '5.5.5.1', origin: 'https://monkyfi.com' } });
      const res = makeRes();
      await handler(req, res);

      expect(res._status).toBe(200);
      expect(res._body).toEqual({ text: 'Hello from Claude!' });

      expect(mockFetch).toHaveBeenCalledOnce();
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toBe('https://api.anthropic.com/v1/messages');
      expect(opts.method).toBe('POST');
      expect(opts.headers['x-api-key']).toBe('test-key-123');
      expect(opts.headers['anthropic-version']).toBe('2023-06-01');

      const body = JSON.parse(opts.body);
      expect(body.model).toBe('claude-haiku-4-5');
      expect(body.max_tokens).toBe(1024);
      expect(body.system).toBeDefined();
    });

    it('should use server-side SYSTEM_PROMPT (not client-provided)', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ content: [{ text: 'response' }] }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const req = makeReq({
        body: { messages: [{ role: 'user', content: 'hi' }], system: 'INJECTED PROMPT' },
        headers: { 'x-forwarded-for': '5.5.5.2', origin: 'https://monkyfi.com' },
      });
      const res = makeRes();
      await handler(req, res);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.system).not.toBe('INJECTED PROMPT');
      expect(body.system).toContain('Monkyfi AI');
    });

    it('should return empty string when Anthropic response has no content', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ content: [] }),
      }));

      const req = makeReq({ headers: { 'x-forwarded-for': '5.5.5.3', origin: 'https://monkyfi.com' } });
      const res = makeRes();
      await handler(req, res);

      expect(res._status).toBe(200);
      expect(res._body).toEqual({ text: '' });
    });

    it('should return empty string when content property is missing', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      }));

      const req = makeReq({ headers: { 'x-forwarded-for': '5.5.5.4', origin: 'https://monkyfi.com' } });
      const res = makeRes();
      await handler(req, res);

      expect(res._status).toBe(200);
      expect(res._body).toEqual({ text: '' });
    });
  });

  // --- Anthropic API error ---
  describe('Anthropic API errors', () => {
    it('should return 502 when Anthropic API returns an error', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        text: async () => 'Rate limited',
      }));

      const req = makeReq({ headers: { 'x-forwarded-for': '6.6.6.1', origin: 'https://monkyfi.com' } });
      const res = makeRes();
      await handler(req, res);

      expect(res._status).toBe(502);
      expect(res._body).toEqual({ error: 'AI service is temporarily unavailable' });
    });

    it('should return 502 when Anthropic returns 401', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      }));

      const req = makeReq({ headers: { 'x-forwarded-for': '6.6.6.2', origin: 'https://monkyfi.com' } });
      const res = makeRes();
      await handler(req, res);

      expect(res._status).toBe(502);
      expect(res._body.error).toBe('AI service is temporarily unavailable');
    });
  });

  // --- Network / fetch error ---
  describe('Network errors', () => {
    it('should return 500 when fetch throws a network error', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network failure')));

      const req = makeReq({ headers: { 'x-forwarded-for': '7.7.7.1', origin: 'https://monkyfi.com' } });
      const res = makeRes();
      await handler(req, res);

      expect(res._status).toBe(500);
      expect(res._body.error).toBe('Something went wrong. Please try again.');
    });

    it('should return 500 when fetch throws a TypeError', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

      const req = makeReq({ headers: { 'x-forwarded-for': '7.7.7.2', origin: 'https://monkyfi.com' } });
      const res = makeRes();
      await handler(req, res);

      expect(res._status).toBe(500);
      expect(res._body.error).toBe('Something went wrong. Please try again.');
    });
  });
});
