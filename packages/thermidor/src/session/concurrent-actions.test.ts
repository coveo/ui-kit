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

const ANNOUNCEMENTS = {
  concurrentActions: {[SHELL_ID]: [CACHED, UNCACHED]},
  cachedActions: {[SHELL_ID]: {[CACHED]: {ttlMs: 60_000}}},
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
  initialize: false,
};

const encoder = new TextEncoder();

interface Call {
  request: {message: string | null; action: {name: string; context: unknown} | null};
  signal?: AbortSignal;
  emit(event: Record<string, unknown>): void;
  close(): void;
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
      metadata: {concurrentActions: {[SHELL_ID]: []}, turnOpeningActions: {[SHELL_ID]: [CACHED]}},
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
    it('reports a refused request as a development warning only', async () => {
      const session = shellSession();
      const initialization = session.initialization;
      callMock.mockImplementationOnce(async () => ({success: false, error: 'Refused'}));

      await dispatch(session, 'boots');

      expect(session.actionError).toBeUndefined();
      expect(session.initialization).toBe(initialization);
      expect(warned('Refused')).toBe(true);
    });

    it('does not cache an answer that ends in RUN_ERROR', async () => {
      const session = shellSession();
      const sent = dispatch(session, 'boots');
      calls[0].emit(productsUpdate('boots'));
      calls[0].emit({type: 'RUN_ERROR', message: 'productSuggest failed'});
      calls[0].close();
      await sent;

      expect(session.actionError).toBeUndefined();
      expect(warned('productSuggest failed')).toBe(true);

      void dispatch(session, 'boots');

      expect(sentQueries()).toEqual(['boots', 'boots']);
    });
  });

  it('withholds a concurrent action before the session has a token', async () => {
    const session = shellSession(restoredShell({sessionToken: null}));

    await dispatch(session, 'boots');

    expect(calls).toHaveLength(0);
    expect(warned('no token')).toBe(true);
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

  it('sends an action the producer does not announce through the single request', async () => {
    const session = shellSession(restoredShell({metadata: null}));

    void dispatch(session, 'boots');

    expect(session.request).toMatchObject({kind: 'action', name: CACHED});
  });
});
