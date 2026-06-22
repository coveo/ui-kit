import {describe, it, expect, vi, beforeEach} from 'vitest';
import type http from 'node:http';
import {Readable} from 'node:stream';
import {handleRequest, isConverseRoute} from './router.js';

vi.mock('./template-loader.js', () => ({
  loadTemplate: vi.fn().mockResolvedValue('event:test\ndata: {}\n\n'),
}));

function createMockRequest(
  method: string,
  url: string,
  body?: string
): http.IncomingMessage {
  const readable = new Readable();
  readable.push(body ?? null);
  readable.push(null);
  return Object.assign(readable, {method, url}) as http.IncomingMessage;
}

function createMockResponse() {
  let writtenData = '';
  const headers: Record<string, string | number> = {};
  return {
    setHeader: vi.fn((name: string, value: string | number) => {
      headers[name] = value;
    }),
    writeHead: vi.fn(
      (statusCode: number, extraHeaders?: Record<string, string>) => {
        headers['__statusCode'] = statusCode;
        if (extraHeaders) {
          Object.assign(headers, extraHeaders);
        }
      }
    ),
    write: vi.fn((chunk: string) => {
      writtenData += chunk;
    }),
    end: vi.fn((chunk?: string) => {
      if (chunk) writtenData += chunk;
    }),
    _headers: headers,
    _data: () => writtenData,
  } as unknown as http.ServerResponse & {
    _headers: Record<string, string | number>;
    _data: () => string;
  };
}

describe('isConverseRoute', () => {
  it('returns true for /converse', () => {
    expect(isConverseRoute('/converse')).toBe(true);
  });

  it('returns true for a full Coveo API path ending in /converse', () => {
    expect(
      isConverseRoute(
        '/rest/organizations/myorg/commerce/unstable/agentic/converse'
      )
    ).toBe(true);
  });

  it('returns false for /converse/extra', () => {
    expect(isConverseRoute('/converse/extra')).toBe(false);
  });

  it('returns false for /other', () => {
    expect(isConverseRoute('/other')).toBe(false);
  });

  it('returns false for /converses', () => {
    expect(isConverseRoute('/converses')).toBe(false);
  });

  it('strips query parameters before matching', () => {
    expect(isConverseRoute('/converse?foo=bar')).toBe(true);
  });
});

describe('handleRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles OPTIONS with preflight response (204)', () => {
    const req = createMockRequest('OPTIONS', '/converse');
    const res = createMockResponse();

    handleRequest(req, res);

    expect(res.writeHead).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith(
      'Access-Control-Allow-Origin',
      '*'
    );
  });

  it('returns 404 for non-matching paths', () => {
    const req = createMockRequest('POST', '/not-converse');
    const res = createMockResponse();

    handleRequest(req, res);

    expect(res.writeHead).toHaveBeenCalledWith(404, {
      'Content-Type': 'application/json',
    });
    expect(res.end).toHaveBeenCalledWith(JSON.stringify({error: 'Not Found'}));
    expect(res.setHeader).toHaveBeenCalledWith(
      'Access-Control-Allow-Origin',
      '*'
    );
  });

  it('returns 405 for wrong method on matching path', () => {
    const req = createMockRequest('GET', '/converse');
    const res = createMockResponse();

    handleRequest(req, res);

    expect(res.writeHead).toHaveBeenCalledWith(405, {
      'Content-Type': 'application/json',
    });
    expect(res.end).toHaveBeenCalledWith(
      JSON.stringify({error: 'Method Not Allowed'})
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      'Access-Control-Allow-Origin',
      '*'
    );
  });

  it('returns 405 for PUT on matching path', () => {
    const req = createMockRequest('PUT', '/converse');
    const res = createMockResponse();

    handleRequest(req, res);

    expect(res.writeHead).toHaveBeenCalledWith(405, {
      'Content-Type': 'application/json',
    });
    expect(res.end).toHaveBeenCalledWith(
      JSON.stringify({error: 'Method Not Allowed'})
    );
  });

  it('processes valid POST to /converse through the pipeline', async () => {
    const body = JSON.stringify({message: 'hello'});
    const req = createMockRequest('POST', '/converse', body);
    const res = createMockResponse();

    handleRequest(req, res);

    await vi.waitFor(() => {
      expect(res.end).toHaveBeenCalled();
    });

    expect(res.writeHead).toHaveBeenCalledWith(
      200,
      expect.objectContaining({
        'Content-Type': 'text/event-stream',
      })
    );
  });

  it('processes valid POST on full Coveo path', async () => {
    const body = JSON.stringify({message: 'kayaks'});
    const req = createMockRequest(
      'POST',
      '/rest/organizations/myorg/commerce/unstable/agentic/converse',
      body
    );
    const res = createMockResponse();

    handleRequest(req, res);

    await vi.waitFor(() => {
      expect(res.end).toHaveBeenCalled();
    });

    expect(res.writeHead).toHaveBeenCalledWith(
      200,
      expect.objectContaining({
        'Content-Type': 'text/event-stream',
      })
    );
  });

  it('returns 400 for invalid JSON body', async () => {
    const req = createMockRequest('POST', '/converse', 'not json');
    const res = createMockResponse();

    handleRequest(req, res);

    await vi.waitFor(() => {
      expect(res.end).toHaveBeenCalled();
    });

    expect(res.writeHead).toHaveBeenCalledWith(400, {
      'Content-Type': 'application/json',
    });
    const endCall = vi.mocked(res.end).mock.calls[0][0] as string;
    const parsed = JSON.parse(endCall);
    expect(parsed.error).toBe('Invalid JSON');
  });

  it('returns 400 for missing message field', async () => {
    const body = JSON.stringify({notMessage: 'value'});
    const req = createMockRequest('POST', '/converse', body);
    const res = createMockResponse();

    handleRequest(req, res);

    await vi.waitFor(() => {
      expect(res.end).toHaveBeenCalled();
    });

    expect(res.writeHead).toHaveBeenCalledWith(400, {
      'Content-Type': 'application/json',
    });
    const endCall = vi.mocked(res.end).mock.calls[0][0] as string;
    const parsed = JSON.parse(endCall);
    expect(parsed.error).toBe('Missing required field: message');
  });

  it('includes CORS headers on 400 error responses', async () => {
    const req = createMockRequest('POST', '/converse', 'bad json');
    const res = createMockResponse();

    handleRequest(req, res);

    await vi.waitFor(() => {
      expect(res.end).toHaveBeenCalled();
    });

    expect(res.setHeader).toHaveBeenCalledWith(
      'Access-Control-Allow-Origin',
      '*'
    );
  });

  it('handles OPTIONS on non-converse path as preflight', () => {
    const req = createMockRequest('OPTIONS', '/other-path');
    const res = createMockResponse();

    handleRequest(req, res);

    expect(res.writeHead).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
  });
});
