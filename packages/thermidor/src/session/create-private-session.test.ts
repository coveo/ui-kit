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
