import {describe, it, expect, afterEach} from 'vitest';
import http from 'node:http';
import {createMockConverseServer} from './server.js';

function makeRequest(
  server: http.Server,
  options: http.RequestOptions,
  body?: string
): Promise<{
  statusCode: number;
  headers: http.IncomingHttpHeaders;
  body: string;
}> {
  return new Promise((resolve, reject) => {
    const address = server.address();
    if (!address || typeof address === 'string') {
      reject(new Error('Server not listening'));
      return;
    }

    const req = http.request(
      {hostname: '127.0.0.1', port: address.port, ...options},
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () =>
          resolve({
            statusCode: res.statusCode ?? 0,
            headers: res.headers,
            body: data,
          })
        );
      }
    );

    req.on('error', reject);
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

describe('createMockConverseServer', () => {
  let server: http.Server;

  afterEach(async () => {
    if (server?.listening) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it('creates an HTTP server that responds to requests', async () => {
    server = createMockConverseServer();
    await new Promise<void>((resolve) => server.listen(0, resolve));

    const res = await makeRequest(
      server,
      {
        method: 'POST',
        path: '/converse',
        headers: {'Content-Type': 'application/json'},
      },
      JSON.stringify({message: 'hello'})
    );

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/event-stream');
  });

  it('returns 404 for non-matching routes', async () => {
    server = createMockConverseServer();
    await new Promise<void>((resolve) => server.listen(0, resolve));

    const res = await makeRequest(server, {
      method: 'GET',
      path: '/not-found',
    });

    expect(res.statusCode).toBe(404);
  });

  it('returns 405 for wrong method on /converse', async () => {
    server = createMockConverseServer();
    await new Promise<void>((resolve) => server.listen(0, resolve));

    const res = await makeRequest(server, {
      method: 'GET',
      path: '/converse',
    });

    expect(res.statusCode).toBe(405);
  });

  it('handles OPTIONS preflight', async () => {
    server = createMockConverseServer();
    await new Promise<void>((resolve) => server.listen(0, resolve));

    const res = await makeRequest(server, {
      method: 'OPTIONS',
      path: '/converse',
    });

    expect(res.statusCode).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('*');
  });

  it('returns the server without starting it', () => {
    server = createMockConverseServer();
    expect(server).toBeInstanceOf(http.Server);
    expect(server.listening).toBe(false);
  });
});
