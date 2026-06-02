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

describe('api/chat handler', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv, ANTHROPIC_API_KEY: 'test-key-123' };
  });

  // --- CORS ---
  it('should set CORS headers on every request', async () => {
    const req = { method: 'POST', body: { messages: [{ role: 'user', content: 'hi' }] } };
    const res = makeRes();

    // Mock fetch so the actual API call doesn't go out
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ content: [{ text: 'hello' }] }),
    }));

    await handler(req, res);

    expect(res._headers['Access-Control-Allow-Origin']).toBe('*');
    expect(res._headers['Access-Control-Allow-Methods']).toBe('POST, OPTIONS');
    expect(res._headers['Access-Control-Allow-Headers']).toBe('Content-Type');
  });

  // --- OPTIONS preflight ---
  it('should return 200 for OPTIONS preflight', async () => {
    const req = { method: 'OPTIONS' };
    const res = makeRes();

    await handler(req, res);

    expect(res._status).toBe(200);
    expect(res._ended).toBe(true);
  });

  // --- Method not allowed ---
  it('should return 405 for GET requests', async () => {
    const req = { method: 'GET' };
    const res = makeRes();

    await handler(req, res);

    expect(res._status).toBe(405);
    expect(res._body).toEqual({ error: 'Method not allowed' });
  });

  it('should return 405 for PUT requests', async () => {
    const req = { method: 'PUT' };
    const res = makeRes();

    await handler(req, res);

    expect(res._status).toBe(405);
    expect(res._body).toEqual({ error: 'Method not allowed' });
  });

  it('should return 405 for DELETE requests', async () => {
    const req = { method: 'DELETE' };
    const res = makeRes();

    await handler(req, res);

    expect(res._status).toBe(405);
    expect(res._body).toEqual({ error: 'Method not allowed' });
  });

  // --- Missing API key ---
  it('should return 500 when ANTHROPIC_API_KEY is not set', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const req = { method: 'POST', body: { messages: [{ role: 'user', content: 'hi' }] } };
    const res = makeRes();

    await handler(req, res);

    expect(res._status).toBe(500);
    expect(res._body).toEqual({ error: 'Server misconfigured: missing API key' });
  });

  it('should return 500 when ANTHROPIC_API_KEY is empty string', async () => {
    process.env.ANTHROPIC_API_KEY = '';
    const req = { method: 'POST', body: { messages: [{ role: 'user', content: 'hi' }] } };
    const res = makeRes();

    await handler(req, res);

    expect(res._status).toBe(500);
    expect(res._body).toEqual({ error: 'Server misconfigured: missing API key' });
  });

  // --- Bad request body ---
  it('should return 400 when messages is missing', async () => {
    const req = { method: 'POST', body: { system: 'hello' } };
    const res = makeRes();

    await handler(req, res);

    expect(res._status).toBe(400);
    expect(res._body).toEqual({ error: 'messages array is required' });
  });

  it('should return 400 when messages is empty array', async () => {
    const req = { method: 'POST', body: { messages: [] } };
    const res = makeRes();

    await handler(req, res);

    expect(res._status).toBe(400);
    expect(res._body).toEqual({ error: 'messages array is required' });
  });

  it('should return 400 when messages is not an array', async () => {
    const req = { method: 'POST', body: { messages: 'not-array' } };
    const res = makeRes();

    await handler(req, res);

    expect(res._status).toBe(400);
    expect(res._body).toEqual({ error: 'messages array is required' });
  });

  it('should return 400 when body is null', async () => {
    const req = { method: 'POST', body: null };
    const res = makeRes();

    await handler(req, res);

    expect(res._status).toBe(400);
    expect(res._body).toEqual({ error: 'messages array is required' });
  });

  it('should return 400 when body is undefined', async () => {
    const req = { method: 'POST' };
    const res = makeRes();

    await handler(req, res);

    expect(res._status).toBe(400);
    expect(res._body).toEqual({ error: 'messages array is required' });
  });

  // --- Successful proxy ---
  it('should proxy to Anthropic and return text on success', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ content: [{ text: 'Hello from Claude!' }] }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const req = {
      method: 'POST',
      body: {
        messages: [{ role: 'user', content: 'hi' }],
        system: 'You are helpful.',
      },
    };
    const res = makeRes();

    await handler(req, res);

    expect(res._status).toBe(200);
    expect(res._body).toEqual({ text: 'Hello from Claude!' });

    // Verify the fetch call was made correctly
    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe('https://api.anthropic.com/v1/messages');
    expect(opts.method).toBe('POST');
    expect(opts.headers['x-api-key']).toBe('test-key-123');
    expect(opts.headers['anthropic-version']).toBe('2023-06-01');

    const body = JSON.parse(opts.body);
    expect(body.model).toBe('claude-haiku-4-5');
    expect(body.max_tokens).toBe(1024);
    expect(body.system).toBe('You are helpful.');
    expect(body.messages).toEqual([{ role: 'user', content: 'hi' }]);
  });

  it('should omit system from Anthropic payload when not provided', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ content: [{ text: 'response' }] }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const req = {
      method: 'POST',
      body: { messages: [{ role: 'user', content: 'hi' }] },
    };
    const res = makeRes();

    await handler(req, res);

    expect(res._status).toBe(200);
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.system).toBeUndefined();
  });

  it('should return empty string when Anthropic response has no content', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ content: [] }),
    }));

    const req = { method: 'POST', body: { messages: [{ role: 'user', content: 'hi' }] } };
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

    const req = { method: 'POST', body: { messages: [{ role: 'user', content: 'hi' }] } };
    const res = makeRes();

    await handler(req, res);

    expect(res._status).toBe(200);
    expect(res._body).toEqual({ text: '' });
  });

  // --- Anthropic API error ---
  it('should return 502 when Anthropic API returns an error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      text: async () => 'Rate limited',
    }));

    const req = { method: 'POST', body: { messages: [{ role: 'user', content: 'hi' }] } };
    const res = makeRes();

    await handler(req, res);

    expect(res._status).toBe(502);
    expect(res._body).toEqual({ error: 'AI service error', detail: 'Rate limited' });
  });

  it('should return 502 when Anthropic returns 401', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized',
    }));

    const req = { method: 'POST', body: { messages: [{ role: 'user', content: 'hi' }] } };
    const res = makeRes();

    await handler(req, res);

    expect(res._status).toBe(502);
    expect(res._body.error).toBe('AI service error');
    expect(res._body.detail).toBe('Unauthorized');
  });

  // --- Network / fetch error ---
  it('should return 500 when fetch throws a network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network failure')));

    const req = { method: 'POST', body: { messages: [{ role: 'user', content: 'hi' }] } };
    const res = makeRes();

    await handler(req, res);

    expect(res._status).toBe(500);
    expect(res._body.error).toBe('Server error');
    expect(res._body.detail).toContain('Network failure');
  });

  it('should return 500 when fetch throws a TypeError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    const req = { method: 'POST', body: { messages: [{ role: 'user', content: 'hi' }] } };
    const res = makeRes();

    await handler(req, res);

    expect(res._status).toBe(500);
    expect(res._body.error).toBe('Server error');
    expect(res._body.detail).toContain('Failed to fetch');
  });
});
