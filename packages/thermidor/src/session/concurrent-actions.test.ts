import {afterEach, beforeEach, describe, expect, it, vi, type MockInstance} from 'vitest';

/**
 * Actions the producer announces as concurrent or cached (ADR-020): they are sent beside the
 * session's single request, only the latest dispatch from a node is applied, a cached answer is
 * reused, and their answers are applied without being recorded in a run.
 *
 * The endpoint client is mocked: every call gets a stream the test feeds and closes, and is
 * recorded with its request and abort signal.
 */

const callMock =
  vi.fn<
    (
      request: unknown,
      configuration: unknown,
      options?: {signal?: AbortSignal}
    ) => Promise<
      {success: true; data: {stream: ReadableStream<Uint8Array>}} | {success: false; error: string}
    >
  >();

vi.mock('@/src/internal/api/unified/unified-endpoint-client.js', () => ({
  createUnifiedEndpointClient: () => ({call: callMock}),
}));

import {z} from 'zod/v4';
import type {ContractsSchema} from './contracts.js';
import {createSession, type SessionConfig} from './create-session.js';
import {SERIALIZED_SESSION_VERSION, type SerializedSession} from './serialize.js';
import type {Activity} from './types.js';

const InstantProductsSchema = z.strictObject({
  component: z.literal('InstantProducts'),
  state: z.strictObject({query: z.string(), products: z.array(z.string())}).optional(),
  actions: z
    .strictObject({
      fetchInstantProducts: z.strictObject({payload: z.strictObject({query: z.string()})}),
      previewInstantProducts: z.strictObject({payload: z.strictObject({query: z.string()})}),
      trackInstantProducts: z.strictObject({payload: z.strictObject({detail: z.unknown()})}),
    })
    .optional(),
});

const CommerceSearchSchema = z.strictObject({
  component: z.literal('CommerceSearch'),
  state: z.strictObject({}).optional(),
});

const contracts = z.discriminatedUnion('component', [
  InstantProductsSchema,
  CommerceSearchSchema,
]) as unknown as ContractsSchema;

const SHELL_ID = 'ui-shell';
const PRODUCTS_ID = 'instant-products';
const CACHED = 'fetchInstantProducts';
const UNCACHED = 'previewInstantProducts';
const TRACKED = 'trackInstantProducts';

const ANNOUNCEMENTS = {
  concurrentActions: {
    [SHELL_ID]: {[CACHED]: {cache: {ttlMs: 60_000}}, [UNCACHED]: {}, [TRACKED]: {}},
  },
};

function shellActivity(metadata?: Record<string, unknown>): Activity {
  return {
    id: 'shell-activity',
    kind: 'a2ui-surface',
    replace: true,
    payload: {
      messages: [
        {
          version: 'v1.0',
          createSurface: {
            surfaceId: SHELL_ID,
            catalogId: 'commerce',
            components: [
              {id: 'root', component: 'CommerceSearch'},
              {id: PRODUCTS_ID, component: 'InstantProducts'},
            ],
          },
        },
      ],
    },
    ...(metadata && {metadata}),
  };
}

function restoredShell({
  metadata = ANNOUNCEMENTS as Record<string, unknown> | null,
  sessionToken = 'gateway-token' as string | null,
} = {}): SerializedSession {
  return {
    version: SERIALIZED_SESSION_VERSION,
    sessionId: 'gateway-session',
    ...(sessionToken && {sessionToken}),
    initialization: {activities: [shellActivity(metadata ?? undefined)], status: 'complete'},
    turns: [],
  };
}

const baseConfig: SessionConfig = {
  contracts,
  organizationId: 'org-1',
  accessToken: 'token-1',
  agentConfigurationId: 'agent-configuration-1',
  trackingId: 'tracking-1',
  navigatorContextProvider: () => ({
    clientId: 'client-1',
    location: null,
    referrer: null,
    userAgent: null,
    language: 'en',
    country: 'US',
    currency: 'USD',
  }),
  initialize: false,
};

const encoder = new TextEncoder();

interface Call {
  request: {message: string | null; action: {name: string; context: unknown} | null};
  signal?: AbortSignal;
  emit(event: Record<string, unknown>): void;
  close(): void;
  /** Errors the stream, as a transport failure does. */
  error(reason: unknown): void;
}

let calls: Call[];

function answerEveryCallWithAStream(): void {
  callMock.mockImplementation(async (request, _configuration, options) => {
    let controller!: ReadableStreamDefaultController<Uint8Array>;
    const stream = new ReadableStream<Uint8Array>({
      start(c) {
        controller = c;
      },
    });
    calls.push({
      request: request as Call['request'],
      signal: options?.signal,
      emit: (event) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`)),
      close: () => {
        try {
          controller.close();
        } catch {
          // Already cancelled by an abort.
        }
      },
      error: (reason) => controller.error(reason),
    });
    return {success: true, data: {stream}};
  });
}

function productsUpdate(query: string, extra: Record<string, unknown> = {}) {
  return {
    type: 'ACTIVITY_SNAPSHOT',
    messageId: `products-${query}`,
    activityType: 'a2ui-surface',
    content: {messages: [productsWrite(query)]},
    ...extra,
  };
}

function productsWrite(query: string) {
  return {
    version: 'v1.0',
    updateDataModel: {
      surfaceId: SHELL_ID,
      path: `/state/${PRODUCTS_ID}`,
      value: {query, products: [`${query} 1`, `${query} 2`]},
    },
  };
}

function answer(call: Call, query: string): void {
  call.emit(productsUpdate(query));
  call.emit({type: 'RUN_FINISHED'});
  call.close();
}

function dispatch(session: ReturnType<typeof createSession>, query: string, name = CACHED) {
  return session.dispatchAction({
    userAction: {name, surfaceId: SHELL_ID, sourceComponentId: PRODUCTS_ID, context: {query}},
  });
}

function shownQuery(session: ReturnType<typeof createSession>): unknown {
  const shell = session.state[SHELL_ID] as {state?: Record<string, {query?: string}>} | undefined;
  return shell?.state?.[PRODUCTS_ID]?.query;
}

function sentQueries(): unknown[] {
  return calls.map((call) => (call.request.action?.context as {query?: string})?.query);
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('concurrent and cached actions (ADR-020)', () => {
  let warn: MockInstance<typeof console.warn>;

  beforeEach(() => {
    calls = [];
    callMock.mockReset();
    answerEveryCallWithAStream();
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warn.mockRestore();
    vi.clearAllMocks();
  });

  function warned(fragment: string): boolean {
    return warn.mock.calls.some(([message]) => String(message).includes(fragment));
  }

  function shellSession(serialized = restoredShell()) {
    return createSession({...baseConfig, sessionToRestore: serialized});
  }

  it('sends a concurrent action without setting the session request, and applies its answer', async () => {
    const session = shellSession();

    const sent = dispatch(session, 'boots');

    expect(session.request).toBeUndefined();
    expect(calls).toHaveLength(1);
    expect(calls[0].request).toMatchObject({
      message: null,
      conversationToken: 'gateway-token',
      action: {name: CACHED, sourceComponentId: PRODUCTS_ID, context: {query: 'boots'}},
    });
    answer(calls[0], 'boots');
    await sent;
    expect(shownQuery(session)).toBe('boots');
    expect(session.a2uiMessages.at(-1)).toEqual({
      version: 'v0.9',
      updateDataModel: productsWrite('boots').updateDataModel,
    });
    expect(session.initialization?.activities).toHaveLength(1);
    expect(session.turns).toEqual([]);
  });

  it('answers a cached action from the cache, sending nothing', async () => {
    const session = shellSession();
    const boots = dispatch(session, 'boots');
    answer(calls[0], 'boots');
    await boots;
    const poles = dispatch(session, 'poles');
    answer(calls[1], 'poles');
    await poles;

    await dispatch(session, 'boots');

    expect(sentQueries()).toEqual(['boots', 'poles']);
    expect(shownQuery(session)).toBe('boots');
  });

  it('delivers each cache hit as new objects, so a renderer can tell it from a render', async () => {
    const session = shellSession();
    const lastWrite = () =>
      (session.a2uiMessages.at(-1) as {updateDataModel: {value: unknown}}).updateDataModel.value;
    const boots = dispatch(session, 'boots');
    answer(calls[0], 'boots');
    await boots;
    const answered = lastWrite();

    await dispatch(session, 'boots');

    expect(sentQueries()).toEqual(['boots']);
    expect(lastWrite()).toEqual(answered);
    expect(lastWrite()).not.toBe(answered);
  });

  it('sends a cached action again once the navigator locale changed', async () => {
    let currency = 'USD';
    const session = createSession({
      ...baseConfig,
      navigatorContextProvider: () => ({...baseConfig.navigatorContextProvider(), currency}),
      sessionToRestore: restoredShell(),
    });
    const usd = dispatch(session, 'boots');
    answer(calls[0], 'boots');
    await usd;

    currency = 'CAD';
    const cad = dispatch(session, 'boots');
    answer(calls[1], 'boots');
    await cad;

    expect(sentQueries()).toEqual(['boots', 'boots']);
    expect(calls[1].request).toMatchObject({currency: 'CAD'});
  });

  it('sends nothing, and warns, when the navigator locale is blank', async () => {
    const session = createSession({
      ...baseConfig,
      navigatorContextProvider: () => ({...baseConfig.navigatorContextProvider(), language: ''}),
      sessionToRestore: restoredShell(),
    });

    await dispatch(session, 'boots');

    expect(calls).toHaveLength(0);
    expect(warned('language')).toBe(true);
    expect(session.concurrentFailures).toEqual([
      expect.objectContaining({
        message: expect.stringContaining('language'),
        component: 'InstantProducts',
        name: CACHED,
      }),
    ]);
    expect(session.actionError).toBeUndefined();
    expect(session.concurrentRequests).toEqual([]);
  });

  it('passes over the dispatch in flight when the next one fails on a blank locale', async () => {
    let language = 'en';
    const session = createSession({
      ...baseConfig,
      navigatorContextProvider: () => ({...baseConfig.navigatorContextProvider(), language}),
      sessionToRestore: restoredShell(),
    });
    const cachedBoots = dispatch(session, 'boots');
    const uncachedBoots = dispatch(session, 'boots', UNCACHED);

    language = '';
    await dispatch(session, 'poles');
    await dispatch(session, 'poles', UNCACHED);
    expect(session.concurrentRequests).toEqual([]);
    expect(session.concurrentFailures).toHaveLength(2);
    answer(calls[0], 'boots');
    await cachedBoots;
    await uncachedBoots;

    expect(calls).toHaveLength(2);
    expect(calls[1].signal?.aborted).toBe(true);
    expect(shownQuery(session)).toBeUndefined();
  });

  it('reads the navigator context once per sent action, and sends that read', async () => {
    let reads = 0;
    const session = createSession({
      ...baseConfig,
      navigatorContextProvider: () => ({
        ...baseConfig.navigatorContextProvider(),
        clientId: `client-${++reads}`,
      }),
      sessionToRestore: restoredShell(),
    });

    const boots = dispatch(session, 'boots');
    answer(calls[0], 'boots');
    await boots;

    expect(reads).toBe(1);
    expect(calls[0].request).toMatchObject({clientId: 'client-1'});
  });

  it('answers a cached action from the cache without reading the commerce context', async () => {
    const commerceContextProvider = vi.fn(() => ({cart: []}));
    const session = createSession({
      ...baseConfig,
      commerceContextProvider,
      sessionToRestore: restoredShell(),
    });
    const boots = dispatch(session, 'boots');
    answer(calls[0], 'boots');
    await boots;

    await dispatch(session, 'boots');

    expect(calls).toHaveLength(1);
    expect(commerceContextProvider).toHaveBeenCalledTimes(1);
  });

  it('sends a cached action again once its answer expired', async () => {
    vi.useFakeTimers({toFake: ['Date']});
    try {
      const session = shellSession();
      const boots = dispatch(session, 'boots');
      answer(calls[0], 'boots');
      await boots;

      vi.setSystemTime(Date.now() + 60_000);
      const again = dispatch(session, 'boots');
      answer(calls[1], 'boots');
      await again;

      expect(sentQueries()).toEqual(['boots', 'boots']);
    } finally {
      vi.useRealTimers();
    }
  });

  it('aborts an older uncached request, and applies the latest answer only', async () => {
    const session = shellSession();
    const boots = dispatch(session, 'boots', UNCACHED);
    const poles = dispatch(session, 'poles', UNCACHED);

    expect(calls[0].signal?.aborted).toBe(true);
    expect(calls[1].signal?.aborted).toBe(false);
    answer(calls[1], 'poles');
    await Promise.all([boots, poles]);

    expect(shownQuery(session)).toBe('poles');
    expect(warned('failed')).toBe(false);
  });

  it('sends an uncached action again for the same payload, never answering it from a cache', async () => {
    const session = shellSession();
    const first = dispatch(session, 'boots', UNCACHED);
    answer(calls[0], 'boots');
    await first;

    const second = dispatch(session, 'boots', UNCACHED);

    expect(sentQueries()).toEqual(['boots', 'boots']);
    answer(calls[1], 'boots');
    await second;
    expect(shownQuery(session)).toBe('boots');
  });

  it('never aborts a cached miss: its late answer is cached but not applied', async () => {
    const session = shellSession();
    const boots = dispatch(session, 'boots');
    const poles = dispatch(session, 'poles');

    expect(calls[0].signal?.aborted ?? false).toBe(false);
    answer(calls[1], 'poles');
    await poles;
    answer(calls[0], 'boots');
    await boots;

    expect(shownQuery(session)).toBe('poles');

    await dispatch(session, 'boots');

    expect(sentQueries()).toEqual(['boots', 'poles']);
    expect(shownQuery(session)).toBe('boots');
  });

  it('joins an in-flight miss with the same key instead of sending another', async () => {
    const session = shellSession();
    const first = dispatch(session, 'boots');
    const second = dispatch(session, 'boots');

    expect(calls).toHaveLength(1);
    answer(calls[0], 'boots');
    await Promise.all([first, second]);

    expect(shownQuery(session)).toBe('boots');
  });

  it('shows A again when a recorded write replaced it while A is in flight and A joins', async () => {
    const session = shellSession();
    const firstBoots = dispatch(session, 'boots');
    calls[0].emit(productsUpdate('boots'));
    await flush();
    const turn = session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'jackets'}});
    answer(calls[1], 'jackets');
    await turn;

    expect(shownQuery(session)).toBe('jackets');

    const secondBoots = dispatch(session, 'boots');
    calls[0].emit({type: 'RUN_FINISHED'});
    calls[0].close();
    await Promise.all([firstBoots, secondBoots]);

    expect(calls).toHaveLength(2);
    expect(shownQuery(session)).toBe('boots');
  });

  it('applies nothing an aborted request still delivers', async () => {
    const session = shellSession();
    const first = dispatch(session, 'boots', UNCACHED);
    await flush();
    calls[0].emit(productsUpdate('stale'));
    const second = dispatch(session, 'boots', UNCACHED);
    await flush();

    expect(shownQuery(session)).toBeUndefined();

    answer(calls[1], 'boots');
    await Promise.all([first, second]);

    expect(shownQuery(session)).toBe('boots');
  });

  it('shows A after A, B, A while A is in flight, with one request for A', async () => {
    const session = shellSession();
    const firstBoots = dispatch(session, 'boots');
    const poles = dispatch(session, 'poles');
    calls[0].emit(productsUpdate('boots'));
    await flush();

    expect(shownQuery(session)).toBeUndefined();

    const secondBoots = dispatch(session, 'boots');
    calls[0].emit({type: 'RUN_FINISHED'});
    calls[0].close();
    await Promise.all([firstBoots, secondBoots]);

    expect(sentQueries()).toEqual(['boots', 'poles']);
    expect(shownQuery(session)).toBe('boots');

    answer(calls[1], 'poles');
    await poles;

    expect(shownQuery(session)).toBe('boots');
  });

  it('shows A after A, B, A when A was answered before B but is still in flight', async () => {
    const session = shellSession();
    const firstBoots = dispatch(session, 'boots');
    calls[0].emit(productsUpdate('boots'));
    await flush();
    const poles = dispatch(session, 'poles');
    answer(calls[1], 'poles');
    await poles;

    expect(shownQuery(session)).toBe('poles');

    const secondBoots = dispatch(session, 'boots');
    calls[0].emit({type: 'RUN_FINISHED'});
    calls[0].close();
    await Promise.all([firstBoots, secondBoots]);

    expect(sentQueries()).toEqual(['boots', 'poles']);
    expect(shownQuery(session)).toBe('boots');
  });

  it('makes a cache hit the latest dispatch, so an older answer is not applied', async () => {
    const session = shellSession();
    const boots = dispatch(session, 'boots');
    answer(calls[0], 'boots');
    await boots;
    const poles = dispatch(session, 'poles');

    await dispatch(session, 'boots');
    answer(calls[1], 'poles');
    await poles;

    expect(shownQuery(session)).toBe('boots');
  });

  it('only applies writes to the data model of nodes the recorded runs hold', async () => {
    const session = shellSession();
    const surfaces = session.surfaces;
    const sent = dispatch(session, 'boots');
    calls[0].emit({
      type: 'ACTIVITY_SNAPSHOT',
      messageId: 'mixed',
      activityType: 'a2ui-surface',
      metadata: {concurrentActions: {[SHELL_ID]: {}}, turnOpeningActions: {[SHELL_ID]: [CACHED]}},
      content: {
        messages: [
          {
            version: 'v1.0',
            createSurface: {
              surfaceId: 'new-surface',
              components: [{id: 'root', component: 'CommerceSearch'}],
            },
          },
          {
            version: 'v1.0',
            updateComponents: {
              surfaceId: SHELL_ID,
              components: [{id: 'ghost', component: 'InstantProducts'}],
            },
          },
          {
            version: 'v1.0',
            updateDataModel: {surfaceId: SHELL_ID, path: '/state/ghost', value: {}},
          },
          {
            version: 'v1.0',
            updateDataModel: {surfaceId: SHELL_ID, path: `/state/${PRODUCTS_ID}`, value: 'bad'},
          },
          productsWrite('boots'),
        ],
      },
    });
    calls[0].emit({type: 'RUN_FINISHED'});
    calls[0].close();
    const messageCount = session.a2uiMessages.length;
    await sent;

    expect(shownQuery(session)).toBe('boots');
    expect(session.a2uiMessages.slice(messageCount)).toEqual([
      {version: 'v0.9', updateDataModel: productsWrite('boots').updateDataModel},
    ]);
    expect(session.surfaces).toBe(surfaces);
    expect(warned('known nodes')).toBe(true);

    void dispatch(session, 'poles');

    expect(session.request).toBeUndefined();
    expect(calls).toHaveLength(2);
  });

  it('caches only the accepted messages, so a hit warns no more', async () => {
    const session = shellSession();
    const sent = dispatch(session, 'boots');
    calls[0].emit({
      type: 'ACTIVITY_SNAPSHOT',
      messageId: 'mixed',
      activityType: 'a2ui-surface',
      content: {
        messages: [
          {
            version: 'v1.0',
            updateDataModel: {surfaceId: SHELL_ID, path: '/state/ghost', value: {}},
          },
          productsWrite('boots'),
        ],
      },
    });
    calls[0].emit({type: 'RUN_FINISHED'});
    calls[0].close();
    await sent;
    const poles = dispatch(session, 'poles');
    answer(calls[1], 'poles');
    await poles;
    warn.mockClear();
    const messageCount = session.a2uiMessages.length;

    await dispatch(session, 'boots');

    expect(calls).toHaveLength(2);
    expect(shownQuery(session)).toBe('boots');
    expect(session.a2uiMessages.slice(messageCount)).toEqual([
      {version: 'v0.9', updateDataModel: productsWrite('boots').updateDataModel},
    ]);
    expect(warned('known nodes')).toBe(false);
  });

  describe('the unrecorded layer', () => {
    async function shownBoots() {
      const session = shellSession();
      const sent = dispatch(session, 'boots');
      answer(calls[0], 'boots');
      await sent;
      return session;
    }

    it('is replaced by a later recorded write to the same path', async () => {
      const session = await shownBoots();

      const turn = session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'jackets'}});
      calls[1].emit(productsUpdate('jackets'));
      calls[1].emit({type: 'RUN_FINISHED'});
      calls[1].close();
      await turn;

      expect(shownQuery(session)).toBe('jackets');
    });

    it('stays on top of a recorded write to another node', async () => {
      const session = await shownBoots();

      const turn = session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'jackets'}});
      calls[1].emit({
        type: 'ACTIVITY_SNAPSHOT',
        messageId: 'root-update',
        activityType: 'a2ui-surface',
        content: {
          messages: [
            {
              version: 'v1.0',
              updateDataModel: {surfaceId: SHELL_ID, path: '/state/root', value: {}},
            },
          ],
        },
      });
      calls[1].emit({type: 'RUN_FINISHED'});
      calls[1].close();
      await turn;

      expect(shownQuery(session)).toBe('boots');
      expect((session.state[SHELL_ID] as {state: Record<string, unknown>}).state.root).toEqual({});
    });

    it('is not serialized, and a restored session has none', async () => {
      const session = await shownBoots();

      const serialized = session.serialize();

      expect(serialized.state ?? {}).toEqual({});
      expect(shownQuery(shellSession(serialized))).toBeUndefined();
    });
  });

  describe('failures', () => {
    const productsFailure = (name: string, message: string) => ({
      component: 'InstantProducts',
      name,
      surfaceId: SHELL_ID,
      sourceComponentId: PRODUCTS_ID,
      message,
    });

    it('reports a refused request in concurrentFailures, leaving actionError as it is', async () => {
      const session = shellSession();
      const initialization = session.initialization;
      callMock.mockImplementationOnce(async () => ({success: false, error: 'Refused'}));

      await dispatch(session, 'boots');

      expect(session.concurrentFailures).toEqual([productsFailure(CACHED, 'Refused')]);
      expect(Object.isFrozen(session.concurrentFailures)).toBe(true);
      expect(session.getSnapshot().concurrentFailures).toBe(session.concurrentFailures);
      expect(session.actionError).toBeUndefined();
      expect(session.initialization).toBe(initialization);
      expect(session.request).toBeUndefined();
      expect(warned('Refused')).toBe(true);
    });

    const ONLY_CACHED = {concurrentActions: {[SHELL_ID]: {[CACHED]: {cache: {ttlMs: 60_000}}}}};
    const track = (session: ReturnType<typeof createSession>) =>
      session.dispatchAction({
        userAction: {
          name: TRACKED,
          surfaceId: SHELL_ID,
          sourceComponentId: PRODUCTS_ID,
          context: {detail: 'boots'},
        },
      });

    it("leaves an ordinary action's failure in actionError", async () => {
      const session = shellSession(restoredShell({metadata: ONLY_CACHED}));
      callMock.mockImplementationOnce(async () => ({success: false, error: 'Tracking refused'}));
      await track(session);
      expect(session.request).toBeUndefined();
      expect(session.actionError).toMatchObject({message: 'Tracking refused', name: TRACKED});

      callMock.mockImplementationOnce(async () => ({success: false, error: 'Refused'}));
      await dispatch(session, 'boots');
      expect(session.actionError).toMatchObject({message: 'Tracking refused', name: TRACKED});
      expect(session.concurrentFailures).toEqual([productsFailure(CACHED, 'Refused')]);

      const again = dispatch(session, 'poles');
      answer(calls.at(-1)!, 'poles');
      await again;
      expect(session.actionError).toMatchObject({message: 'Tracking refused', name: TRACKED});
      expect(session.concurrentFailures).toEqual([]);
    });

    it('keeps its failure while the session sends an ordinary action or a prompt', async () => {
      const session = shellSession(restoredShell({metadata: ONLY_CACHED}));
      callMock.mockImplementationOnce(async () => ({success: false, error: 'Refused'}));
      await dispatch(session, 'boots');

      const tracked = track(session);
      answer(calls.at(-1)!, 'boots');
      await tracked;

      expect(session.actionError).toBeUndefined();
      expect(session.concurrentFailures).toEqual([productsFailure(CACHED, 'Refused')]);
    });

    it('reports the code of a RUN_ERROR', async () => {
      const session = shellSession();
      const sent = dispatch(session, 'boots', UNCACHED);
      calls[0].emit({type: 'RUN_ERROR', message: 'Too slow', code: 'AGENT:UPSTREAM_TIMEOUT'});
      calls[0].close();
      await sent;

      expect(session.concurrentFailures).toEqual([
        {...productsFailure(UNCACHED, 'Too slow'), errorCode: 'AGENT:UPSTREAM_TIMEOUT'},
      ]);
      expect(session.concurrentRequests).toEqual([]);
    });

    it('keeps a finished answer applied, and reports nothing, when the stream errors after RUN_FINISHED', async () => {
      const session = shellSession();
      const sent = dispatch(session, 'boots', UNCACHED);
      calls[0].emit(productsUpdate('boots'));
      calls[0].emit({type: 'RUN_FINISHED'});
      // Erroring a stream drops what it has not delivered yet.
      await flush();
      calls[0].error(new Error('Connection reset'));
      await sent;

      expect(session.concurrentFailures).toEqual([]);
      expect(shownQuery(session)).toBe('boots');
      expect(warned('Connection reset')).toBe(false);
    });

    it("keeps the gateway's message and code when the stream errors after RUN_ERROR", async () => {
      const session = shellSession();
      const sent = dispatch(session, 'boots', UNCACHED);
      calls[0].emit({type: 'RUN_ERROR', message: 'Too slow', code: 'AGENT:UPSTREAM_TIMEOUT'});
      await flush();
      calls[0].error(new Error('Connection reset'));
      await sent;

      expect(session.concurrentFailures).toEqual([
        {...productsFailure(UNCACHED, 'Too slow'), errorCode: 'AGENT:UPSTREAM_TIMEOUT'},
      ]);
    });

    it('reports a stream that ends without a terminal event', async () => {
      const session = shellSession();
      const sent = dispatch(session, 'boots', UNCACHED);
      calls[0].emit(productsUpdate('boots'));
      calls[0].close();
      await sent;

      expect(session.concurrentFailures).toEqual([
        productsFailure(UNCACHED, 'Stream ended without a terminal event.'),
      ]);
    });

    it.each(['poles', 'boots'])(
      'reports nothing for an uncached dispatch aborted by a later one for %s',
      async (later) => {
        const session = shellSession();
        const first = dispatch(session, 'boots', UNCACHED);
        const second = dispatch(session, later, UNCACHED);
        await first;

        expect(calls[0].signal?.aborted).toBe(true);
        expect(session.concurrentFailures).toEqual([]);
        expect(warned('failed')).toBe(false);
        answer(calls[1], later);
        await second;
        expect(session.concurrentFailures).toEqual([]);
      }
    );

    it('reports nothing for a cached miss that fails once a later dispatch superseded it', async () => {
      const session = shellSession();
      const boots = dispatch(session, 'boots');
      const poles = dispatch(session, 'poles');
      answer(calls[1], 'poles');
      await poles;

      calls[0].emit({type: 'RUN_ERROR', message: 'productSuggest failed'});
      calls[0].close();
      await boots;

      expect(session.concurrentFailures).toEqual([]);
      expect(shownQuery(session)).toBe('poles');
    });

    it('reports a failed miss once, for every dispatch that joined it', async () => {
      const session = shellSession();
      const listener = vi.fn();
      const first = dispatch(session, 'boots');
      const second = dispatch(session, 'boots');
      session.subscribe(listener);

      calls[0].emit({type: 'RUN_ERROR', message: 'productSuggest failed'});
      calls[0].close();
      await Promise.all([first, second]);

      expect(calls).toHaveLength(1);
      expect(session.concurrentFailures).toEqual([
        productsFailure(CACHED, 'productSuggest failed'),
      ]);
      expect(
        warn.mock.calls.filter(([message]) => String(message).includes('failed'))
      ).toHaveLength(1);
      // One notification for the failure, one for the request leaving the list.
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it("clears its own node action's failure once dispatched again", async () => {
      const session = shellSession();
      callMock.mockImplementationOnce(async () => ({success: false, error: 'Refused'}));
      await dispatch(session, 'boots');

      const again = dispatch(session, 'boots');

      expect(session.concurrentFailures).toEqual([]);
      answer(calls[0], 'boots');
      await again;
      expect(session.concurrentFailures).toEqual([]);
    });

    it('lists the failures of separate actions in the order they failed, each until dispatched again', async () => {
      const session = shellSession();
      callMock.mockImplementationOnce(async () => ({success: false, error: 'First'}));
      await dispatch(session, 'boots', UNCACHED);
      callMock.mockImplementationOnce(async () => ({success: false, error: 'Second'}));
      await dispatch(session, 'boots');
      expect(session.concurrentFailures).toEqual([
        productsFailure(UNCACHED, 'First'),
        productsFailure(CACHED, 'Second'),
      ]);

      const products = dispatch(session, 'boots');
      answer(calls.at(-1)!, 'boots');
      await products;

      expect(session.concurrentFailures).toEqual([productsFailure(UNCACHED, 'First')]);
    });

    it('does not cache an answer that ends in RUN_ERROR', async () => {
      const session = shellSession();
      const sent = dispatch(session, 'boots');
      calls[0].emit(productsUpdate('boots'));
      calls[0].emit({type: 'RUN_ERROR', message: 'productSuggest failed'});
      calls[0].close();
      await sent;

      expect(session.concurrentFailures).toEqual([
        productsFailure(CACHED, 'productSuggest failed'),
      ]);
      expect(warned('productSuggest failed')).toBe(true);

      void dispatch(session, 'boots');

      expect(sentQueries()).toEqual(['boots', 'boots']);
    });

    /**
     * Sends a prompt whose answer announces `kept` only, so far without ending; the uncached
     * action is no longer concurrent by default.
     */
    function revokeUncached(
      session: ReturnType<typeof createSession>,
      kept: Record<string, unknown> = {[CACHED]: {cache: {ttlMs: 60_000}}}
    ) {
      const turn = session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'jackets'}});
      calls.at(-1)!.emit({
        type: 'ACTIVITY_SNAPSHOT',
        messageId: 'shell-activity',
        activityType: 'a2ui-surface',
        content: shellActivity().payload,
        metadata: {concurrentActions: {[SHELL_ID]: kept}},
      });
      return turn;
    }

    /**
     * Dispatches `name` concurrently, revokes it while in flight, then retries it as the session's
     * request, answered. Returns the older call and its dispatch.
     */
    async function retryAfterRevocation(session: ReturnType<typeof createSession>, name: string) {
      const older = dispatch(session, 'boots', name);
      const olderCall = calls.at(-1)!;
      const turn = revokeUncached(session, name === CACHED ? {[UNCACHED]: {}} : undefined);
      calls.at(-1)!.emit({type: 'RUN_FINISHED'});
      calls.at(-1)!.close();
      await turn;
      expect(session.isConcurrent({surfaceId: SHELL_ID, name})).toBe(false);
      expect(session.concurrentRequests).toEqual([
        {component: 'InstantProducts', name, surfaceId: SHELL_ID, sourceComponentId: PRODUCTS_ID},
      ]);

      const retry = dispatch(session, 'poles', name);
      expect(session.request).toMatchObject({kind: 'action', name});
      expect(session.concurrentRequests).toEqual([]);
      answer(calls.at(-1)!, 'poles');
      await retry;
      expect(shownQuery(session)).toBe('poles');
      return {older, olderCall};
    }

    it('aborts an uncached dispatch in flight once the revoked action is sent as a request', async () => {
      const session = shellSession();

      const {older, olderCall} = await retryAfterRevocation(session, UNCACHED);

      expect(olderCall.signal?.aborted).toBe(true);
      await older;
      expect(session.concurrentFailures).toEqual([]);
      expect(session.concurrentRequests).toEqual([]);
    });

    it('applies nothing a cached dispatch in flight answers once the revoked action is sent as a request', async () => {
      const session = shellSession();
      const {older, olderCall} = await retryAfterRevocation(session, CACHED);

      answer(olderCall, 'boots');
      await older;

      expect(shownQuery(session)).toBe('poles');
      expect(session.concurrentRequests).toEqual([]);
    });

    it('reports nothing a cached dispatch in flight fails with once the revoked action is sent as a request', async () => {
      const session = shellSession();
      const {older, olderCall} = await retryAfterRevocation(session, CACHED);

      olderCall.emit({type: 'RUN_ERROR', message: 'productSuggest failed'});
      olderCall.close();
      await older;

      expect(session.concurrentFailures).toEqual([]);
      expect(warned('productSuggest failed')).toBe(false);
    });

    it('reports nothing a cached miss fails with once the same payload, no longer cached, was answered', async () => {
      const session = shellSession();
      const older = dispatch(session, 'boots');
      const olderCall = calls.at(-1)!;
      const turn = revokeUncached(session, {[CACHED]: {}});
      calls.at(-1)!.emit({type: 'RUN_FINISHED'});
      calls.at(-1)!.close();
      await turn;

      const retry = dispatch(session, 'boots');
      expect(calls).toHaveLength(3);
      answer(calls.at(-1)!, 'boots');
      await retry;
      olderCall.emit({type: 'RUN_ERROR', message: 'productSuggest failed'});
      olderCall.close();
      await older;

      expect(session.concurrentFailures).toEqual([]);
      expect(warned('productSuggest failed')).toBe(false);
      expect(shownQuery(session)).toBe('boots');
    });

    it('drops its failure once the node action, no longer announced, is sent as a request', async () => {
      const session = shellSession();
      callMock.mockImplementationOnce(async () => ({success: false, error: 'Refused'}));
      await dispatch(session, 'boots', UNCACHED);
      const turn = revokeUncached(session);
      calls.at(-1)!.emit({type: 'RUN_FINISHED'});
      calls.at(-1)!.close();
      await turn;
      expect(session.isConcurrent({surfaceId: SHELL_ID, name: UNCACHED})).toBe(false);
      expect(session.concurrentFailures).toHaveLength(1);

      const retry = dispatch(session, 'boots', UNCACHED);
      expect(session.request).toMatchObject({kind: 'action', name: UNCACHED});
      expect(session.concurrentFailures).toEqual([]);
      answer(calls.at(-1)!, 'boots');
      await retry;

      expect(session.concurrentFailures).toEqual([]);
      expect(session.actionError).toBeUndefined();
    });

    it('keeps its failure when the node action, no longer announced, is withheld', async () => {
      const session = shellSession();
      callMock.mockImplementationOnce(async () => ({success: false, error: 'Refused'}));
      await dispatch(session, 'boots', UNCACHED);
      const turn = revokeUncached(session);
      await flush();
      expect(session.isConcurrent({surfaceId: SHELL_ID, name: UNCACHED})).toBe(false);

      void dispatch(session, 'poles', UNCACHED);

      expect(session.request).toMatchObject({kind: 'prompt'});
      expect(session.concurrentFailures).toEqual([productsFailure(UNCACHED, 'Refused')]);
      calls.at(-1)!.emit({type: 'RUN_FINISHED'});
      calls.at(-1)!.close();
      await turn;
    });
  });

  describe('isConcurrent', () => {
    it('is true for an action the producer announces on the surface, cached or not', () => {
      const session = shellSession();

      expect(session.isConcurrent({surfaceId: SHELL_ID, name: CACHED})).toBe(true);
      expect(session.isConcurrent({surfaceId: SHELL_ID, name: UNCACHED})).toBe(true);
    });

    it('is false for an action not announced, or announced on another surface only', () => {
      const session = shellSession(
        restoredShell({metadata: {concurrentActions: {other: {fetchSuggestions: {}}}}})
      );

      expect(session.isConcurrent({surfaceId: SHELL_ID, name: CACHED})).toBe(false);
      expect(session.isConcurrent({surfaceId: SHELL_ID, name: 'fetchSuggestions'})).toBe(false);
    });

    it('is false before the session has a token, as such a dispatch is withheld', () => {
      const session = shellSession(restoredShell({sessionToken: null}));

      expect(session.isConcurrent({surfaceId: SHELL_ID, name: CACHED})).toBe(false);
    });

    it('can be passed by reference', () => {
      const {isConcurrent} = shellSession();

      expect(isConcurrent({surfaceId: SHELL_ID, name: UNCACHED})).toBe(true);
    });
  });

  it('withholds a concurrent action before the session has a token', async () => {
    const session = shellSession(restoredShell({sessionToken: null}));

    await dispatch(session, 'boots');

    expect(calls).toHaveLength(0);
    expect(warned('no token')).toBe(true);
    expect(session.concurrentRequests).toEqual([]);
    expect(session.concurrentFailures).toEqual([]);
  });

  describe('concurrentRequests', () => {
    const productsRequest = (name: string) => ({
      component: 'InstantProducts',
      name,
      surfaceId: SHELL_ID,
      sourceComponentId: PRODUCTS_ID,
    });

    it('lists a concurrent action while its answer is awaited, in a new snapshot', () => {
      const session = shellSession();
      const before = session.getSnapshot();
      expect(session.concurrentRequests).toEqual([]);
      expect(before.concurrentRequests).toBe(session.concurrentRequests);
      const listener = vi.fn();
      session.subscribe(listener);

      void dispatch(session, 'boots');

      expect(session.concurrentRequests).toEqual([productsRequest(CACHED)]);
      expect(session.request).toBeUndefined();
      expect(listener).toHaveBeenCalled();
      const during = session.getSnapshot();
      expect(during).not.toBe(before);
      expect(during.concurrentRequests).toEqual([productsRequest(CACHED)]);
      expect(Object.isFrozen(during.concurrentRequests)).toBe(true);
    });

    it('drops the action once its answer is applied, before the dispatch resolves', async () => {
      const session = shellSession();
      let listedOnResolve: unknown;
      const sent = dispatch(session, 'boots').then(() => {
        listedOnResolve = session.concurrentRequests;
      });

      answer(calls[0], 'boots');
      await sent;

      expect(listedOnResolve).toEqual([]);
      expect(shownQuery(session)).toBe('boots');
    });

    it('keeps the same snapshot, and notifies nothing, for a cache hit with nothing listed', async () => {
      const session = shellSession();
      const boots = dispatch(session, 'boots');
      answer(calls[0], 'boots');
      await boots;
      const poles = dispatch(session, 'poles');
      answer(calls[1], 'poles');
      await poles;
      const before = session.getSnapshot();
      const listener = vi.fn();
      session.subscribe(listener);

      const hit = dispatch(session, 'poles');

      expect(session.getSnapshot().concurrentRequests).toBe(before.concurrentRequests);
      expect(session.getSnapshot().concurrentFailures).toBe(before.concurrentFailures);
      expect(session.concurrentRequests).toEqual([]);
      await hit;
      expect(calls).toHaveLength(2);
      // Only the write of the cached answer notifies.
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('lists one entry per node action, the latest dispatch, with no notification when it is dispatched again', async () => {
      const session = shellSession();
      const boots = dispatch(session, 'boots', UNCACHED);
      const listed: number[] = [];
      session.subscribe(() => listed.push(session.getSnapshot().concurrentRequests.length));
      const before = session.getSnapshot().concurrentRequests;

      const poles = dispatch(session, 'poles', UNCACHED);

      expect(listed).toEqual([]);
      expect(session.getSnapshot().concurrentRequests).toBe(before);
      expect(session.concurrentRequests).toEqual([productsRequest(UNCACHED)]);
      await boots;
      expect(session.concurrentRequests).toEqual([productsRequest(UNCACHED)]);

      answer(calls[1], 'poles');
      await poles;
      expect(session.concurrentRequests).toEqual([]);
    });

    it('lists the actions of a node separately, in the order they were sent', async () => {
      const session = shellSession();
      const preview = dispatch(session, 'boots', UNCACHED);
      const fetch = dispatch(session, 'boots');

      expect(session.concurrentRequests).toEqual([
        productsRequest(UNCACHED),
        productsRequest(CACHED),
      ]);

      answer(calls[0], 'boots');
      await preview;
      expect(session.concurrentRequests).toEqual([productsRequest(CACHED)]);
      answer(calls[1], 'boots');
      await fetch;
      expect(session.concurrentRequests).toEqual([]);
    });

    it('drops a cached miss once a later dispatch is answered from the cache, and keeps it dropped', async () => {
      const session = shellSession();
      const poles = dispatch(session, 'poles');
      answer(calls[0], 'poles');
      await poles;
      const boots = dispatch(session, 'boots');

      expect(session.concurrentRequests).toEqual([productsRequest(CACHED)]);
      await dispatch(session, 'poles');
      expect(session.concurrentRequests).toEqual([]);

      answer(calls[1], 'boots');
      await boots;
      expect(session.concurrentRequests).toEqual([]);
      expect(shownQuery(session)).toBe('poles');
    });

    it('notifies a cache hit once, with its answer applied and the lane unlisted together', async () => {
      const session = shellSession();
      const poles = dispatch(session, 'poles');
      answer(calls[0], 'poles');
      await poles;
      void dispatch(session, 'boots');
      const seen: [number, unknown][] = [];
      session.subscribe(() => seen.push([session.concurrentRequests.length, shownQuery(session)]));

      await dispatch(session, 'poles');

      expect(seen).toEqual([[0, 'poles']]);
    });

    it('keeps listing the latest dispatch while one it joined is answered', async () => {
      const session = shellSession();
      const first = dispatch(session, 'boots');
      const second = dispatch(session, 'boots');

      expect(calls).toHaveLength(1);
      expect(session.concurrentRequests).toEqual([productsRequest(CACHED)]);
      answer(calls[0], 'boots');
      await Promise.all([first, second]);

      expect(session.concurrentRequests).toEqual([]);
    });

    describe('a listener dispatching on the same node action as the session publishes', () => {
      function dispatchPolesOnFirstChange(session: ReturnType<typeof createSession>) {
        let poles: Promise<void> | undefined;
        session.subscribe(() => {
          poles ??= dispatch(session, 'poles', UNCACHED);
        });
        return () => poles;
      }

      async function expectPolesAnswered(
        session: ReturnType<typeof createSession>,
        poles: Promise<void> | undefined
      ) {
        const polesCall = calls.find(
          (call) => (call.request.action?.context as {query?: string}).query === 'poles'
        );
        const olderCalls = calls.filter((call) => call !== polesCall).slice(-1);
        expect(poles).toBeDefined();
        expect(polesCall?.signal?.aborted).toBe(false);
        // The older request, superseded before it settled, is aborted rather than left running.
        expect(olderCalls.map((call) => call.signal?.aborted)).toEqual([true]);
        expect(session.concurrentRequests).toEqual([productsRequest(UNCACHED)]);
        answer(polesCall!, 'poles');
        await poles;
        expect(shownQuery(session)).toBe('poles');
        expect(session.concurrentRequests).toEqual([]);
      }

      it('answers the newer dispatch when the older one clears its failure', async () => {
        const session = shellSession();
        callMock.mockImplementationOnce(async () => ({success: false, error: 'Refused'}));
        await dispatch(session, 'boots', UNCACHED);
        const poles = dispatchPolesOnFirstChange(session);

        void dispatch(session, 'boots', UNCACHED);

        await expectPolesAnswered(session, poles());
      });

      it('answers the newer dispatch when the older one is listed', async () => {
        const session = shellSession();
        const poles = dispatchPolesOnFirstChange(session);

        void dispatch(session, 'boots', UNCACHED);

        await expectPolesAnswered(session, poles());
      });
    });

    it('leaves both lists out of the serialized session', async () => {
      const session = shellSession();
      callMock.mockImplementationOnce(async () => ({success: false, error: 'Refused'}));
      await dispatch(session, 'boots', UNCACHED);
      void dispatch(session, 'boots');
      expect(session.concurrentFailures).toHaveLength(1);
      expect(session.concurrentRequests).toHaveLength(1);

      const serialized = JSON.stringify(session.serialize());

      expect(serialized).not.toContain('Refused');
      expect(serialized).not.toContain('concurrentRequests');
      expect(serialized).not.toContain('concurrentFailures');
    });

    it('leaves the session request for a prompt sent meanwhile', () => {
      const session = shellSession();
      void dispatch(session, 'boots');

      void session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'jackets'}});

      expect(session.request).toMatchObject({kind: 'prompt'});
      expect(session.concurrentRequests).toEqual([productsRequest(CACHED)]);
    });
  });

  it('sends a prompt while a concurrent request is in flight, and cancel leaves it be', async () => {
    const session = shellSession();
    const products = dispatch(session, 'boots', UNCACHED);

    const turn = session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'jackets'}});

    expect(session.request).toMatchObject({kind: 'prompt'});
    expect(calls.map((call) => call.request.message)).toEqual([null, 'jackets']);

    session.cancel();
    calls[1].close();
    await turn;

    expect(calls[0].signal?.aborted).toBe(false);
    answer(calls[0], 'boots');
    await products;

    expect(shownQuery(session)).toBe('boots');
    expect(session.turns[0].status).toBe('error');
  });

  it('sends a concurrent action while a prompt is in flight, and leaves the prompt be', async () => {
    const session = shellSession();
    const turn = session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'jackets'}});
    const request = session.request;

    const products = dispatch(session, 'boots');
    answer(calls[1], 'boots');
    await products;

    expect(shownQuery(session)).toBe('boots');
    expect(session.request).toBe(request);
    expect(session.turns[0].status).toBe('streaming');

    calls[0].emit({type: 'RUN_FINISHED'});
    calls[0].close();
    await turn;

    expect(session.turns[0].status).toBe('complete');
  });

  it('sends an action announced as both concurrent and turn-opening as concurrent, with a warning', async () => {
    const session = shellSession(
      restoredShell({metadata: {...ANNOUNCEMENTS, turnOpeningActions: {[SHELL_ID]: [CACHED]}}})
    );

    const sent = dispatch(session, 'boots');

    expect(session.request).toBeUndefined();
    expect(warned('both concurrent and turn-opening')).toBe(true);
    answer(calls[0], 'boots');
    await sent;
    expect(session.turns).toEqual([]);
  });

  describe('the dispatch promise', () => {
    it('resolves once the answer to a concurrent action is applied', async () => {
      const session = shellSession();
      let settled = false;

      const sent = dispatch(session, 'boots').then(() => {
        settled = true;
      });
      await flush();

      expect(settled).toBe(false);
      answer(calls[0], 'boots');
      await sent;
      expect(shownQuery(session)).toBe('boots');
    });

    it('does not wait for a prompt in flight', async () => {
      const session = shellSession();
      const turn = session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'jackets'}});

      const sent = dispatch(session, 'boots');
      answer(calls[1], 'boots');
      await sent;

      expect(session.request).toEqual(expect.objectContaining({kind: 'prompt'}));
      answer(calls[0], 'jackets');
      await turn;
    });
  });

  it('resolves, warns and reports a dispatch that fails before anything is sent', async () => {
    const session = shellSession();
    const detail: Record<string, unknown> = {};
    detail['self'] = detail;

    await expect(
      session.dispatchAction({
        userAction: {
          name: TRACKED,
          surfaceId: SHELL_ID,
          sourceComponentId: PRODUCTS_ID,
          context: {detail},
        },
      })
    ).resolves.toBeUndefined();

    expect(calls).toHaveLength(0);
    expect(warned(`${TRACKED} failed`)).toBe(true);
    expect(session.concurrentFailures).toMatchObject([
      {name: TRACKED, component: 'InstantProducts'},
    ]);
    expect(session.actionError).toBeUndefined();
    expect(session.concurrentRequests).toEqual([]);
  });

  it('sends an action the producer does not announce through the single request', async () => {
    const session = shellSession(restoredShell({metadata: null}));

    void dispatch(session, 'boots');

    expect(session.request).toMatchObject({kind: 'action', name: CACHED});
  });
});
