import {beforeEach, describe, expect, it, vi} from 'vitest';

const callMock =
  vi.fn<
    (
      request: Record<string, unknown>,
      configuration: unknown,
      options?: {signal?: AbortSignal}
    ) => Promise<{success: true; data: {stream: ReadableStream<Uint8Array>}}>
  >();

vi.mock('@/src/internal/api/unified/unified-endpoint-client.js', () => ({
  createUnifiedEndpointClient: () => ({call: callMock}),
}));

import {z} from 'zod/v4';
import type {ContractsSchema} from './contracts.js';
import {createPrivateSession, type PrivateSessionConfig} from './create-private-session.js';
import {createSession} from './create-session.js';
import {SERIALIZED_SESSION_VERSION} from './serialize.js';

const contracts = z.discriminatedUnion('component', [
  z.strictObject({
    component: z.literal('Pagination'),
    actions: z
      .strictObject({
        selectPage: z.strictObject({payload: z.strictObject({page: z.number().int().min(0)})}),
      })
      .optional(),
  }),
]) as unknown as ContractsSchema;

const PAGINATION_SURFACE = {
  type: 'ACTIVITY_SNAPSHOT',
  messageId: 'surface-activity',
  activityType: 'a2ui-surface',
  content: {
    messages: [
      {
        version: 'v1.0',
        createSurface: {
          surfaceId: 'commerce-search-surface',
          components: [
            {id: 'root', component: 'CommerceSearch'},
            {id: 'pagination-1', component: 'Pagination'},
          ],
        },
      },
    ],
  },
};

const SELECT_PAGE = {
  userAction: {
    name: 'selectPage',
    surfaceId: 'commerce-search-surface',
    sourceComponentId: 'pagination-1',
    context: {page: 2},
  },
};

const encoder = new TextEncoder();

/** Answers every call with a stream that sends `activities` and then ends. */
function answerWith(...activities: Record<string, unknown>[]): void {
  callMock.mockImplementation(async () => ({
    success: true,
    data: {
      stream: new ReadableStream<Uint8Array>({
        start(controller) {
          for (const activity of activities) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(activity)}\n\n`));
          }
          controller.close();
        },
      }),
    },
  }));
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

const LOCALE = {language: 'fr', country: 'CA', currency: 'CAD'};

const navigatorContextProvider = () => ({
  clientId: 'client-1',
  location: null,
  referrer: null,
  userAgent: null,
  ...LOCALE,
});

function requests(): Record<string, unknown>[] {
  return callMock.mock.calls.map(([request]) => request);
}

function config(overrides: Partial<PrivateSessionConfig> = {}): PrivateSessionConfig {
  return {
    contracts,
    organizationId: 'org-1',
    accessToken: 'token-1',
    navigatorContextProvider,
    initialize: false,
    ...overrides,
  };
}

/** Sends `initialize`, a prompt and a component action, in that order. */
async function sendEachRequestKind(overrides: Partial<PrivateSessionConfig>) {
  const session = createPrivateSession(config({...overrides, initialize: true}));
  await flush();
  await session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'find shoes'}});
  await session.dispatchAction(SELECT_PAGE);
  const sent = requests();
  expect(sent.map((request) => (request.action as {name: string} | null)?.name)).toEqual([
    'initialize',
    undefined,
    'selectPage',
  ]);
  return {session, sent};
}

describe('createPrivateSession', () => {
  beforeEach(() => {
    callMock.mockReset();
    answerWith({type: 'RUN_STARTED'}, PAGINATION_SURFACE, {type: 'RUN_FINISHED'});
  });

  it('sends the navigator locale, and no agent configuration or tracking id, on initialize, prompt and action', async () => {
    const {session, sent} = await sendEachRequestKind({});

    for (const request of sent) {
      expect(request).toMatchObject(LOCALE);
      expect(request).not.toHaveProperty('agentConfigurationId');
      expect(request).not.toHaveProperty('trackingId');
    }
    expect(sent[1]).toMatchObject({message: 'find shoes'});
    expect(session.actionError).toBeUndefined();
  });

  it('sends the ids when they are set, alongside the locale', async () => {
    const {sent} = await sendEachRequestKind({
      agentConfigurationId: 'agent-configuration-1',
      trackingId: 'tracking-1',
    });

    for (const request of sent) {
      expect(request).toMatchObject({
        ...LOCALE,
        agentConfigurationId: 'agent-configuration-1',
        trackingId: 'tracking-1',
      });
    }
  });

  it('leaves out an id that is not set', async () => {
    const {sent} = await sendEachRequestKind({trackingId: 'tracking-1'});

    for (const request of sent) {
      expect(request).toMatchObject({...LOCALE, trackingId: 'tracking-1'});
      expect(request).not.toHaveProperty('agentConfigurationId');
    }
  });

  it('throws when the navigatorContextProvider is missing', () => {
    expect(() =>
      createPrivateSession(config({navigatorContextProvider: undefined as never}))
    ).toThrow('navigatorContextProvider');
  });

  it.each(['language', 'country', 'currency'])(
    'fails the run, without a request, when the navigator %s is blank',
    async (key) => {
      const session = createPrivateSession(
        config({navigatorContextProvider: () => ({...navigatorContextProvider(), [key]: ' '})})
      );

      await session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'find shoes'}});

      expect(callMock).not.toHaveBeenCalled();
      expect(session.turns.at(-1)?.error).toContain(key);
    }
  );

  it('does not throw when the ids are blank, and sends them as they are', async () => {
    const session = createPrivateSession(config({agentConfigurationId: '', trackingId: '  '}));

    await session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'find shoes'}});

    expect(requests()[0]).toMatchObject({agentConfigurationId: '', trackingId: '  '});
  });

  it('sends its locale with an action the producer announces as concurrent', async () => {
    answerWith(
      {type: 'RUN_STARTED', conversationSessionId: 'session-1', conversationToken: 'token-1'},
      {
        ...PAGINATION_SURFACE,
        metadata: {concurrentActions: {'commerce-search-surface': {selectPage: {}}}},
      },
      {type: 'RUN_FINISHED'}
    );
    const session = createPrivateSession(config());
    await session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'find shoes'}});

    await session.dispatchAction(SELECT_PAGE);

    expect(requests()).toHaveLength(2);
    expect(requests()[1]).toMatchObject({...LOCALE, action: {name: 'selectPage'}});
    expect(requests()[1]).not.toHaveProperty('agentConfigurationId');
  });

  describe('with a sessionId', () => {
    const SESSION_ID = '0b5b8e0e-4f1a-4c51-9d3c-5d2f9f6e8a11';

    function answerWithTokenFor(sessionId: string): void {
      answerWith(
        {type: 'RUN_STARTED', conversationSessionId: sessionId, conversationToken: 'token-1'},
        PAGINATION_SURFACE,
        {type: 'RUN_FINISHED'}
      );
    }

    it('exposes the id right after creation, before any request', () => {
      const session = createPrivateSession(config({sessionId: SESSION_ID}));

      expect(session.sessionId).toBe(SESSION_ID);
      expect(callMock).not.toHaveBeenCalled();
    });

    it('sends the id on a first prompt when the session does not initialize', async () => {
      answerWithTokenFor(SESSION_ID);
      const session = createPrivateSession(config({sessionId: SESSION_ID}));

      await session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'find shoes'}});
      await session.dispatchAction(SELECT_PAGE);

      expect(requests()).toHaveLength(2);
      for (const request of requests()) {
        expect(request).toMatchObject({conversationSessionId: SESSION_ID});
      }
    });

    it('sends the id on initialize and every request after it', async () => {
      answerWithTokenFor(SESSION_ID);
      const {sent} = await sendEachRequestKind({sessionId: SESSION_ID});

      for (const request of sent) {
        expect(request).toMatchObject({conversationSessionId: SESSION_ID});
      }
    });

    it('serializes the id, so a restored session continues with it', () => {
      const session = createPrivateSession(config({sessionId: SESSION_ID}));

      const restored = createPrivateSession(config({sessionToRestore: session.serialize()}));

      expect(restored.sessionId).toBe(SESSION_ID);
    });

    it('gives the id up when the first prompt fails before the token, so the retry lets the endpoint assign one', async () => {
      answerWith({type: 'RUN_ERROR', message: 'Agent failed'});
      const session = createPrivateSession(config({sessionId: SESSION_ID}));
      await session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'find shoes'}});

      expect(session.sessionId).toBeUndefined();
      answerWith(
        {type: 'RUN_STARTED', conversationSessionId: 'session-1', conversationToken: 'token-1'},
        {type: 'RUN_FINISHED'}
      );
      session.retry(session.turns[0].id);
      await flush();

      expect(requests()[0]).toMatchObject({conversationSessionId: SESSION_ID});
      expect(requests()[1].conversationSessionId).toBeUndefined();
      expect(session.sessionId).toBe('session-1');
    });

    it('gives the id up when the first prompt is cancelled before the token', async () => {
      callMock.mockImplementationOnce(async () => ({
        success: true,
        data: {stream: new ReadableStream<Uint8Array>()},
      }));
      const session = createPrivateSession(config({sessionId: SESSION_ID}));
      const first = session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'cut'}});
      await flush();
      session.cancel();
      await first;

      expect(session.sessionId).toBeUndefined();
      answerWith(
        {type: 'RUN_STARTED', conversationSessionId: 'session-1', conversationToken: 'token-1'},
        {type: 'RUN_FINISHED'}
      );
      await session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'find shoes'}});

      expect(requests()[1].conversationSessionId).toBeUndefined();
      expect(session.sessionId).toBe('session-1');
    });

    it('keeps the id after a later failure once the endpoint sent the token', async () => {
      answerWith(
        {type: 'RUN_STARTED', conversationSessionId: SESSION_ID, conversationToken: 'token-1'},
        {type: 'RUN_FINISHED'}
      );
      const session = createPrivateSession(config({sessionId: SESSION_ID}));
      await session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'find shoes'}});
      answerWith({type: 'RUN_ERROR', message: 'Agent failed'});

      await session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'find socks'}});
      await session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'find hats'}});

      expect(session.turns[1].status).toBe('error');
      expect(session.sessionId).toBe(SESSION_ID);
      expect(requests()[2]).toMatchObject({
        conversationSessionId: SESSION_ID,
        conversationToken: 'token-1',
      });
    });

    it('drops the id when restored during the first request, before the token', async () => {
      const serialized = createPrivateSession(config({sessionId: SESSION_ID})).serialize();
      answerWith({type: 'RUN_ERROR', message: 'Agent failed'});
      const session = createPrivateSession(config({sessionToRestore: serialized}));
      await session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'find shoes'}});

      expect(session.sessionId).toBeUndefined();
      answerWithTokenFor('session-1');
      session.retry(session.turns[0].id);
      await flush();

      expect(requests()[0]).toMatchObject({conversationSessionId: SESSION_ID});
      expect(requests()[1].conversationSessionId).toBeUndefined();
      expect(session.sessionId).toBe('session-1');
    });

    function refuseNextWith(status: number): void {
      callMock.mockImplementationOnce(
        async () =>
          ({
            success: false,
            error: `HTTP ${status}`,
            status,
          }) as never
      );
    }

    it.each([429, 503, 400, 409])(
      'keeps the id when the endpoint refuses the first prompt with a %i, so the retry sends it again',
      async (status) => {
        refuseNextWith(status);
        answerWithTokenFor(SESSION_ID);
        const session = createPrivateSession(config({sessionId: SESSION_ID}));
        await session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'find shoes'}});

        expect(session.sessionId).toBe(SESSION_ID);
        session.retry(session.turns[0].id);
        await flush();

        expect(requests().at(-1)).toMatchObject({conversationSessionId: SESSION_ID});
        expect(session.sessionId).toBe(SESSION_ID);
      }
    );

    it('keeps the id when the endpoint refuses initialize, so the next request sends it again', async () => {
      refuseNextWith(429);
      answerWithTokenFor(SESSION_ID);
      const session = createPrivateSession(config({sessionId: SESSION_ID, initialize: true}));
      await flush();

      expect(session.initialization?.status).toBe('error');
      expect(session.sessionId).toBe(SESSION_ID);
      await session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'find shoes'}});

      expect(requests()[1]).toMatchObject({conversationSessionId: SESSION_ID});
    });

    it.each([
      ['drops', 'no response', undefined, 'session-1'],
      ['drops', 'a 502', 502, 'session-1'],
      ['drops', 'a 504', 504, 'session-1'],
      ['keeps', 'a 503', 503, SESSION_ID],
    ])(
      '%s the id before retrying an initialize that got %s',
      async (_verb, _label, status, retriedId) => {
        vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout', 'Date']});
        try {
          callMock.mockImplementationOnce(
            async () => ({success: false, error: 'Unavailable', status, transient: {}}) as never
          );
          answerWithTokenFor(retriedId);
          const session = createPrivateSession(config({sessionId: SESSION_ID, initialize: true}));
          await vi.advanceTimersByTimeAsync(1000);

          expect(requests()[0]).toMatchObject({conversationSessionId: SESSION_ID});
          expect(requests()[1].conversationSessionId).toBe(
            retriedId === SESSION_ID ? SESSION_ID : undefined
          );
          expect(session.sessionId).toBe(retriedId);
        } finally {
          vi.useRealTimers();
        }
      }
    );

    it('drops the id when the endpoint answers the first prompt with a 403', async () => {
      refuseNextWith(403);
      const session = createPrivateSession(config({sessionId: SESSION_ID}));

      await session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'find shoes'}});

      expect(session.sessionId).toBeUndefined();
    });

    it('drops the id when the first prompt gets no response', async () => {
      callMock.mockImplementationOnce(
        async () =>
          ({
            success: false,
            error: 'Network error',
          }) as never
      );
      const session = createPrivateSession(config({sessionId: SESSION_ID}));

      await session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'find shoes'}});

      expect(session.sessionId).toBeUndefined();
    });

    it('keeps the id when the first prompt is never sent', async () => {
      callMock.mockImplementationOnce(
        async () =>
          ({
            success: false,
            error: 'Configuration error',
            unsent: true,
          }) as never
      );
      const session = createPrivateSession(config({sessionId: SESSION_ID}));

      await session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'find shoes'}});

      expect(session.sessionId).toBe(SESSION_ID);
    });

    it('throws when a sessionToRestore is passed too', () => {
      const serialized = createPrivateSession(config()).serialize();

      expect(() =>
        createPrivateSession(config({sessionId: SESSION_ID, sessionToRestore: serialized}))
      ).toThrow('not both');
    });
  });

  describe('without a sessionId', () => {
    it('leaves the id undefined, and out of the first request, until the endpoint sends one', async () => {
      answerWith(
        {type: 'RUN_STARTED', conversationSessionId: 'session-1', conversationToken: 'token-1'},
        {type: 'RUN_FINISHED'}
      );
      const session = createPrivateSession(config());

      expect(session.sessionId).toBeUndefined();
      await session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'find shoes'}});
      await session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'find socks'}});

      expect(requests()[0].conversationSessionId).toBeUndefined();
      expect(requests()[1]).toMatchObject({conversationSessionId: 'session-1'});
      expect(session.sessionId).toBe('session-1');
    });

    it('keeps a restored id that has a token when a request fails', async () => {
      answerWith({type: 'RUN_ERROR', message: 'Agent failed'});
      const session = createPrivateSession(
        config({
          sessionToRestore: {
            version: SERIALIZED_SESSION_VERSION,
            turns: [],
            sessionId: 'session-1',
            sessionToken: 'token-1',
          },
        })
      );

      await session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'find shoes'}});

      expect(session.sessionId).toBe('session-1');
    });

    it('exposes the id of a restored session', () => {
      const session = createPrivateSession(
        config({
          sessionToRestore: {
            version: SERIALIZED_SESSION_VERSION,
            turns: [],
            sessionId: 'session-1',
          },
        })
      );

      expect(session.sessionId).toBe('session-1');
    });
  });

  it('leaves the public createSession on its required ids and navigator locale', async () => {
    const session = createSession({
      contracts,
      organizationId: 'org-1',
      accessToken: 'token-1',
      agentConfigurationId: 'agent-configuration-1',
      trackingId: 'tracking-1',
      navigatorContextProvider,
      initialize: false,
    });

    await session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'find shoes'}});

    expect(Object.keys(requests()[0]).sort()).toEqual(
      [
        'action',
        'agentConfigurationId',
        'context',
        'conversationSessionId',
        'conversationToken',
        'clientId',
        'country',
        'currency',
        'language',
        'message',
        'trackingId',
      ].sort()
    );
    expect(() =>
      createSession({
        ...config(),
        agentConfigurationId: '',
        trackingId: 't',
      })
    ).toThrow('agentConfigurationId');
  });
});
