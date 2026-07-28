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

    const req = http.request({hostname: '127.0.0.1', port: address.port, ...options}, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () =>
        resolve({
          statusCode: res.statusCode ?? 0,
          headers: res.headers,
          body: data,
        })
      );
    });

    req.on('error', reject);
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

function parseEvents(body: string): Record<string, unknown>[] {
  return body
    .split('\n\n')
    .filter(Boolean)
    .map(
      (frame) => JSON.parse(frame.split('\n')[1].replace('data:', '')) as Record<string, unknown>
    );
}

function getCartItems(events: Record<string, unknown>[]): unknown[] {
  const activity = events.find((event) => event['type'] === 'ACTIVITY_SNAPSHOT');
  const content = activity?.['content'] as {a2ui_operations?: Array<Record<string, unknown>>};
  const dataOperation = content.a2ui_operations?.find(
    (operation) => 'updateDataModel' in operation
  );
  const update = dataOperation?.['updateDataModel'] as {
    value?: {controllers?: Record<string, {items?: unknown[]}>};
  };
  return update?.value?.controllers?.['shopping-cart']?.items ?? [];
}

describe('createMockConverseServer', () => {
  let server: http.Server;

  const startServer = async () => {
    const app = createMockConverseServer();
    server = app.listen(0);
    await new Promise<void>((resolve) => server.once('listening', () => resolve()));
  };

  afterEach(async () => {
    if (server?.listening) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it('creates an HTTP server that responds to requests', async () => {
    await startServer();

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
    await startServer();

    const res = await makeRequest(server, {
      method: 'GET',
      path: '/not-found',
    });

    expect(res.statusCode).toBe(404);
  });

  it('returns 405 for wrong method on /converse', async () => {
    await startServer();

    const res = await makeRequest(server, {
      method: 'GET',
      path: '/converse',
    });

    expect(res.statusCode).toBe(405);
  });

  it('handles OPTIONS preflight', async () => {
    await startServer();

    const res = await makeRequest(server, {
      method: 'OPTIONS',
      path: '/converse',
    });

    expect(res.statusCode).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('*');
  });

  it('returns an app-like server with listen()', () => {
    const app = createMockConverseServer();
    expect(typeof app.listen).toBe('function');
  });

  it('handles full converse API route', async () => {
    await startServer();
    const res = await makeRequest(
      server,
      {
        method: 'POST',
        path: '/rest/organizations/myorg/commerce/unstable/agentic/converse',
        headers: {'Content-Type': 'application/json'},
      },
      JSON.stringify({message: 'kayaks'})
    );

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/event-stream');
  });

  it('streams the Thermidor schema catalog example for its dedicated prompt', async () => {
    await startServer();
    const res = await makeRequest(
      server,
      {
        method: 'POST',
        path: '/rest/organizations/myorg/commerce/unstable/agentic/converse',
        headers: {'Content-Type': 'application/json'},
      },
      JSON.stringify({message: 'Show the Thermidor catalog'})
    );

    const events = parseEvents(res.body);
    const activity = events.find((event) => event['type'] === 'ACTIVITY_SNAPSHOT');

    expect(activity).toMatchObject({
      type: 'ACTIVITY_SNAPSHOT',
      messageId: 'commerce-catalog-example',
      activityType: 'a2ui-surface',
      replace: true,
    });
    const content = activity?.['content'] as {a2ui_operations: Array<Record<string, unknown>>};
    expect(content.a2ui_operations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          version: 'v0.9',
          createSurface: expect.objectContaining({
            surfaceId: 'commerce-catalog-example',
            catalogId: 'https://schema.thermidor.coveo.com/a2-ui/catalog.json',
          }),
        }),
        expect.objectContaining({
          version: 'v0.9',
          updateDataModel: expect.objectContaining({path: '/'}),
        }),
        expect.objectContaining({
          version: 'v0.9',
          updateComponents: expect.objectContaining({
            components: expect.arrayContaining([
              expect.objectContaining({component: 'ProductCarousel'}),
              expect.objectContaining({component: 'Cart'}),
            ]),
          }),
        }),
      ])
    );

    expect(events.some((event) => event['type'] === 'STATE_SNAPSHOT')).toBe(false);
    expect(getCartItems(events)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({productId: 'trail-running-shoes-001', quantity: 1}),
      ])
    );
  });

  it.each([
    ['setItems', {items: []}, []],
    [
      'updateItemQuantity',
      {
        item: {
          productId: 'trail-running-shoes-001',
          name: 'Peak Trail Running Shoes',
          price: 99.99,
          quantity: 2,
        },
      },
      [expect.objectContaining({productId: 'trail-running-shoes-001', quantity: 2})],
    ],
  ])('returns authoritative A2UI cart state for %s', async (action, payload, expectedItems) => {
    await startServer();
    const res = await makeRequest(
      server,
      {
        method: 'POST',
        path: '/rest/organizations/myorg/commerce/unstable/agentic/converse',
        headers: {'Content-Type': 'application/json'},
      },
      JSON.stringify({
        action: {
          controllerId: 'shopping-cart',
          controllerSchema: 'https://schema.thermidor.coveo.com/controllers/cart.schema.json',
          action,
          payload,
        },
      })
    );

    expect(res.statusCode).toBe(200);
    expect(getCartItems(parseEvents(res.body))).toEqual(expectedItems);
  });

  it('rejects an invalid controller action', async () => {
    await startServer();
    const res = await makeRequest(
      server,
      {method: 'POST', path: '/converse', headers: {'Content-Type': 'application/json'}},
      JSON.stringify({
        action: {
          controllerId: 'shopping-cart',
          controllerSchema: 'https://schema.thermidor.coveo.com/controllers/cart.schema.json',
          action: 'updateItemQuantity',
          payload: {item: {quantity: 0}},
        },
      })
    );

    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body)).toEqual({error: 'Invalid controller action'});
  });

  it('returns 400 for invalid JSON payload', async () => {
    await startServer();
    const res = await makeRequest(
      server,
      {
        method: 'POST',
        path: '/converse',
        headers: {'Content-Type': 'application/json'},
      },
      '{bad'
    );

    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body)).toMatchObject({error: 'Invalid JSON'});
  });

  it('returns 400 when message and action are missing', async () => {
    await startServer();
    const res = await makeRequest(
      server,
      {
        method: 'POST',
        path: '/converse',
        headers: {'Content-Type': 'application/json'},
      },
      JSON.stringify({trackingId: 'x'})
    );

    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body)).toEqual({
      error: 'Missing required field: message or action',
    });
  });

  it('sets CORS headers on non-POST converse route', async () => {
    await startServer();
    const res = await makeRequest(server, {
      method: 'GET',
      path: '/converse',
    });

    expect(res.statusCode).toBe(405);
    expect(res.headers['access-control-allow-origin']).toBe('*');
  });

  it('sets CORS headers on unknown route', async () => {
    await startServer();
    const res = await makeRequest(server, {
      method: 'GET',
      path: '/unknown',
    });

    expect(res.statusCode).toBe(404);
    expect(res.headers['access-control-allow-origin']).toBe('*');
  });
});
