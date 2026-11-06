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

  it('returns 400 when message is missing', async () => {
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
      error: 'Missing required field: message',
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

  it('accepts a schema action request with message: null and an action object', async () => {
    await startServer();
    const res = await makeRequest(
      server,
      {
        method: 'POST',
        path: '/converse-schema',
        headers: {'Content-Type': 'application/json'},
      },
      JSON.stringify({
        message: null,
        action: {name: 'selectPage', sourceComponentId: 'pagination-1', context: {page: 1}},
      })
    );

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/event-stream');
    expect(res.headers['access-control-allow-origin']).toBe('*');
  });

  it('mints new surface ids for each prompt, and answers an action on the surface it came from', async () => {
    await startServer();
    const post = (body: unknown) =>
      makeRequest(
        server,
        {method: 'POST', path: '/converse-schema', headers: {'Content-Type': 'application/json'}},
        JSON.stringify(body)
      );
    const createdIds = (stream: string) =>
      [...stream.matchAll(/"createSurface":\{"surfaceId":"([^"]+)"/g)].map((match) => match[1]);
    const surfaceIds = (stream: string) =>
      new Set([...stream.matchAll(/"surfaceId":"([^"]+)"/g)].map((match) => match[1]));

    const first = createdIds((await post({message: 'water sports'})).body);
    const second = createdIds((await post({message: 'water sports'})).body);

    expect(first.length).toBeGreaterThan(0);
    expect(second.filter((surfaceId) => first.includes(surfaceId))).toEqual([]);

    const searchSurfaceId = first.at(-1)!;
    const action = await post({
      message: null,
      action: {
        name: 'selectPage',
        surfaceId: searchSurfaceId,
        sourceComponentId: 'pagination-1',
        context: {page: 1},
      },
    });

    expect([...surfaceIds(action.body)]).toEqual([searchSurfaceId]);
  });

  it('announces the turn-opening actions of a next-actions bar in the snapshot metadata', async () => {
    await startServer();
    const res = await makeRequest(
      server,
      {method: 'POST', path: '/converse-schema', headers: {'Content-Type': 'application/json'}},
      JSON.stringify({
        message: 'Build a beginner surfing kit with budget, mid-range, and premium options',
      })
    );
    const snapshots = [...res.body.matchAll(/^data:(.+)$/gm)]
      .map((match) => JSON.parse(match[1]))
      .filter((event) => event.type === 'ACTIVITY_SNAPSHOT');
    const nextActionsSurfaceIds = snapshots.flatMap((event) =>
      event.content.messages
        .map(
          (message: {createSurface?: {surfaceId: string; components: {component: string}[]}}) =>
            message.createSurface
        )
        .filter((create?: {components: {component: string}[]}) =>
          create?.components.some((node) => node.component === 'NextActionsBar')
        )
        .map((create: {surfaceId: string}) => create.surfaceId)
    );
    const announced = snapshots
      .filter((event) => event.metadata)
      .map((event) => event.metadata.turnOpeningActions);

    expect(nextActionsSurfaceIds.length).toBeGreaterThan(0);
    expect(announced).toEqual(
      nextActionsSurfaceIds.map((surfaceId) => ({
        [surfaceId]: ['selectAction', 'selectSearchOption'],
      }))
    );
  });

  describe('schema sessions', () => {
    interface SseEvent {
      event: string;
      data: Record<string, unknown>;
    }

    const postSchema = (body: Record<string, unknown>) =>
      makeRequest(
        server,
        {method: 'POST', path: '/converse-schema', headers: {'Content-Type': 'application/json'}},
        JSON.stringify(body)
      );

    const parseEvents = (body: string): SseEvent[] =>
      body
        .split('\n\n')
        .filter((chunk) => chunk.trim().length > 0)
        .map((chunk) => {
          const [eventLine, dataLine] = chunk.split('\n');
          return {
            event: eventLine.slice('event:'.length),
            data: JSON.parse(dataLine.slice('data:'.length)),
          };
        });

    const surfaceMessages = (events: SseEvent[]) =>
      events
        .filter(({event}) => event === 'ACTIVITY_SNAPSHOT')
        .flatMap(({data}) => (data.content as {messages: Array<Record<string, unknown>>}).messages);

    const createdSurfaceIds = (events: SseEvent[]) =>
      surfaceMessages(events)
        .map((message) => message.createSurface as {surfaceId: string} | undefined)
        .filter((createSurface) => createSurface !== undefined)
        .map(({surfaceId}) => surfaceId);

    const sessionKeys = (events: SseEvent[]) => {
      const {conversationSessionId, conversationToken} = events.find(
        ({event}) => event === 'turn_started'
      )!.data as {conversationSessionId: string; conversationToken: string};
      return {conversationSessionId, conversationToken};
    };

    const statesByNode = (events: SseEvent[]) =>
      Object.fromEntries(
        surfaceMessages(events)
          .map(
            (message) =>
              message.updateDataModel as {surfaceId: string; path: string; value: unknown}
          )
          .filter((op) => op !== undefined)
          .map((op) => [`${op.surfaceId} ${op.path}`, op.value])
      );

    const initialize = async () => {
      const res = await postSchema({message: null, action: {name: 'initialize', context: {}}});
      return parseEvents(res.body);
    };

    it('answers initialize with new session keys and the session shell', async () => {
      await startServer();
      const first = await initialize();
      const second = await initialize();

      expect(sessionKeys(first).conversationSessionId).toEqual(expect.any(String));
      expect(sessionKeys(first).conversationToken).toEqual(expect.any(String));
      expect(sessionKeys(second).conversationSessionId).not.toBe(
        sessionKeys(first).conversationSessionId
      );
      const [createSurface] = surfaceMessages(first).map((message) => message.createSurface);
      expect(createSurface).toMatchObject({
        components: [
          {id: 'root', component: 'SessionShell'},
          {id: 'search-box', component: 'SearchBox'},
          {id: 'query-suggestions', component: 'QuerySuggestions'},
          {id: 'instant-products', component: 'InstantProducts'},
        ],
      });
      expect(createdSurfaceIds(second)[0]).not.toBe(createdSurfaceIds(first)[0]);
    });

    it('refuses initialize with a session token', async () => {
      await startServer();
      const res = await postSchema({
        message: null,
        conversationSessionId: 'session-1',
        conversationToken: 'token-1',
        action: {name: 'initialize', context: {}},
      });

      expect(res.statusCode).toBe(400);
      expect(res.headers['access-control-allow-origin']).toBe('*');
      expect(JSON.parse(res.body)).toEqual({
        error: 'initialize opens a session: send it without a session token',
      });
    });

    it("answers fetchSuggestions on the shell's surface, keeping the session", async () => {
      await startServer();
      const opened = await initialize();
      const keys = sessionKeys(opened);
      const [shellId] = createdSurfaceIds(opened);
      const fetchSuggestions = (query: string) =>
        postSchema({
          message: null,
          ...keys,
          action: {
            name: 'fetchSuggestions',
            surfaceId: shellId,
            sourceComponentId: 'query-suggestions',
            context: {query},
          },
        }).then((res) => parseEvents(res.body));

      const surf = await fetchSuggestions('surf');
      const empty = await fetchSuggestions('');

      expect(sessionKeys(surf)).toEqual(keys);
      expect(statesByNode(surf)[`${shellId} /state/query-suggestions`]).toMatchObject({
        query: 'surf',
        completions: [{expression: 'surfboards'}, {}, {}, {}, {}],
      });
      expect(statesByNode(empty)[`${shellId} /state/query-suggestions`]).toEqual({
        query: '',
        completions: [],
      });
    });

    const fetchInstantProducts = (
      keys: Partial<Record<'conversationSessionId' | 'conversationToken', string>>,
      surfaceId: string,
      query: string
    ) =>
      postSchema({
        message: null,
        ...keys,
        action: {
          name: 'fetchInstantProducts',
          surfaceId,
          sourceComponentId: 'instant-products',
          context: {query},
        },
      });

    it('answers fetchInstantProducts beside a streaming answer, without taking its turn slot', async () => {
      await startServer();
      const opened = await initialize();
      const keys = sessionKeys(opened);
      const [shellId] = createdSurfaceIds(opened);
      const prompt = postSchema({message: 'hello', ...keys});
      await new Promise((resolve) => setTimeout(resolve, 100));

      const [products, conflict] = await Promise.all([
        fetchInstantProducts(keys, shellId, 'surfboards'),
        postSchema({message: 'water sports', ...keys}),
      ]);

      expect(products.statusCode).toBe(200);
      expect(products.headers['access-control-allow-origin']).toBe('*');
      expect(
        statesByNode(parseEvents(products.body))[`${shellId} /state/instant-products`]
      ).toMatchObject({query: 'surfboards', products: [{}, {}, {}, {}]});
      expect(conflict.statusCode).toBe(409);
      expect((await prompt).statusCode).toBe(200);

      const answered = parseEvents((await postSchema({message: 'water sports', ...keys})).body);
      const searchSurfaceId = createdSurfaceIds(answered).at(-1)!;
      const page = await postSchema({
        message: null,
        ...keys,
        action: {
          name: 'selectPage',
          surfaceId: searchSurfaceId,
          sourceComponentId: 'pagination-2',
          context: {page: 1},
        },
      });
      expect(page.statusCode).toBe(200);
      expect(
        statesByNode(parseEvents(page.body))[`${searchSurfaceId} /state/query-summary-2`]
      ).toMatchObject({query: 'Water Sports'});
    });

    it('refuses fetchInstantProducts without a session', async () => {
      await startServer();
      const [shellId] = createdSurfaceIds(await initialize());

      const res = await fetchInstantProducts({}, shellId, 'surfboards');

      expect(res.statusCode).toBe(400);
      expect(res.headers['access-control-allow-origin']).toBe('*');
      expect(JSON.parse(res.body)).toEqual({
        errorCode: 'AGENT:ACTION_NOT_APPLICABLE',
        message: expect.any(String),
      });
    });

    it('frees the session once the stream of a disconnected client ends', async () => {
      await startServer();
      const keys = sessionKeys(await initialize());
      await new Promise<void>((resolve) => {
        const address = server.address() as {port: number};
        const req = http.request(
          {
            hostname: '127.0.0.1',
            port: address.port,
            method: 'POST',
            path: '/converse-schema',
            headers: {'Content-Type': 'application/json'},
          },
          (res) =>
            res.once('data', () => {
              req.destroy();
              resolve();
            })
        );
        req.on('error', () => {});
        req.on('close', resolve);
        req.end(JSON.stringify({message: 'water sports', ...keys}));
      });

      await expect
        .poll(async () => (await postSchema({message: 'water sports', ...keys})).statusCode, {
          timeout: 5000,
          interval: 200,
        })
        .toBe(200);
    });

    it('answers 409 to a request on a session with a request in flight', async () => {
      await startServer();
      const keys = sessionKeys(await initialize());
      const prompt = postSchema({message: 'hello', ...keys});
      await new Promise((resolve) => setTimeout(resolve, 100));

      const conflict = await postSchema({message: 'water sports', ...keys});
      const otherSession = await postSchema({message: 'water sports'});

      expect(conflict.statusCode).toBe(409);
      expect(conflict.headers['access-control-allow-origin']).toBe('*');
      expect(JSON.parse(conflict.body)).toEqual({
        errorCode: 'AGENT:ACTION_IN_FLIGHT',
        message: 'Another turn is in progress for this session.',
      });
      expect(otherSession.statusCode).toBe(200);
      expect((await prompt).statusCode).toBe(200);

      const afterwards = await postSchema({message: 'water sports', ...keys});
      expect(afterwards.statusCode).toBe(200);
    });
  });

  it('returns 400 on schema route when both message and action are absent', async () => {
    await startServer();
    const res = await makeRequest(
      server,
      {
        method: 'POST',
        path: '/converse-schema',
        headers: {'Content-Type': 'application/json'},
      },
      JSON.stringify({trackingId: 'x'})
    );

    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body)).toEqual({
      error: 'Missing required field: message or action',
    });
  });
});
