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
import {CLIENT_OWNED_REQUEST_KEYS} from '@/src/internal/api/unified/unified-endpoint-types.js';
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

const localeSchema = z.object({
  language: z.string().min(1),
  country: z.string().length(2),
  currency: z.string().length(3),
});

function requests(): Record<string, unknown>[] {
  return callMock.mock.calls.map(([request]) => request);
}

function config(
  fields: () => Record<string, unknown>,
  overrides: Partial<PrivateSessionConfig> = {}
): PrivateSessionConfig {
  return {
    contracts,
    organizationId: 'org-1',
    accessToken: 'token-1',
    initialize: false,
    request: {schema: localeSchema, fields},
    ...overrides,
  };
}

describe('createPrivateSession', () => {
  beforeEach(() => {
    callMock.mockReset();
    answerWith({type: 'RUN_STARTED'}, PAGINATION_SURFACE, {type: 'RUN_FINISHED'});
  });

  it('sends its fields, and no agent configuration or tracking id, on initialize, prompt and action', async () => {
    const locale = {language: 'fr', country: 'CA', currency: 'CAD'};
    const session = createPrivateSession(config(() => locale, {initialize: true}));

    await flush();
    await session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'find shoes'}});
    await session.dispatchAction(SELECT_PAGE);

    const sent = requests();
    expect(sent.map((request) => (request.action as {name: string} | null)?.name)).toEqual([
      'initialize',
      undefined,
      'selectPage',
    ]);
    expect(sent[1]).toMatchObject({message: 'find shoes'});
    for (const request of sent) {
      expect(request).toMatchObject(locale);
      expect(request).not.toHaveProperty('agentConfigurationId');
      expect(request).not.toHaveProperty('trackingId');
    }
    expect(session.actionError).toBeUndefined();
  });

  it('sends its fields with an action the producer announces as concurrent', async () => {
    const locale = {language: 'fr', country: 'CA', currency: 'CAD'};
    answerWith(
      {type: 'RUN_STARTED', conversationSessionId: 'session-1', conversationToken: 'token-1'},
      {
        ...PAGINATION_SURFACE,
        metadata: {concurrentActions: {'commerce-search-surface': {selectPage: {}}}},
      },
      {type: 'RUN_FINISHED'}
    );
    const session = createPrivateSession(config(() => locale));
    await session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'find shoes'}});

    await session.dispatchAction(SELECT_PAGE);

    expect(requests()).toHaveLength(2);
    expect(requests()[1]).toMatchObject({...locale, action: {name: 'selectPage'}});
    expect(requests()[1]).not.toHaveProperty('agentConfigurationId');
  });

  it('reads the fields again on every request', async () => {
    let locale = {language: 'en', country: 'US', currency: 'USD'};
    const session = createPrivateSession(config(() => locale));

    await session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'first'}});
    locale = {language: 'fr', country: 'FR', currency: 'EUR'};
    await session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'second'}});

    expect(requests()[0]).toMatchObject({language: 'en', country: 'US', currency: 'USD'});
    expect(requests()[1]).toMatchObject({language: 'fr', country: 'FR', currency: 'EUR'});
  });

  it('sends the value the schema parses, such as a default', async () => {
    const session = createPrivateSession({
      ...config(() => ({trackingId: 'tracking-1'})),
      request: {
        schema: z.object({trackingId: z.string(), currency: z.string().default('USD')}),
        fields: () => ({trackingId: 'tracking-1'}),
      },
    });

    await session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'find shoes'}});

    expect(requests()[0]).toMatchObject({trackingId: 'tracking-1', currency: 'USD'});
  });

  describe('invalid fields', () => {
    it('throws from createPrivateSession when the first read is invalid', () => {
      expect(() =>
        createPrivateSession(config(() => ({language: 'en', country: 'USA', currency: 'USD'})))
      ).toThrow(/invalid request fields: country/);
    });

    it('throws when the fields are not an object', () => {
      expect(() => createPrivateSession(config(() => null as never))).toThrow('must be an object');
    });

    it('throws when a field provider throws on the first read', () => {
      expect(() =>
        createPrivateSession(
          config(() => {
            throw new Error('no locale yet');
          })
        )
      ).toThrow('no locale yet');
    });

    it('fails a prompt turn, sending nothing, when the fields turn invalid later', async () => {
      let locale: Record<string, unknown> = {language: 'en', country: 'US', currency: 'USD'};
      const session = createPrivateSession(config(() => locale));
      locale = {language: 'en', country: 'US'};

      await session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'find shoes'}});

      expect(callMock).not.toHaveBeenCalled();
      expect(session.turns[0].status).toBe('error');
      expect(session.turns[0].error).toMatch(/invalid request fields: currency/);
      expect(session.request).toBeUndefined();
    });

    it('reports a failed action, sending nothing, when the fields turn invalid later', async () => {
      let locale: Record<string, unknown> = {language: 'en', country: 'US', currency: 'USD'};
      const session = createPrivateSession(config(() => locale));
      await session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'find shoes'}});
      locale = {...locale, language: ''};

      await session.dispatchAction(SELECT_PAGE);

      expect(callMock).toHaveBeenCalledTimes(1);
      expect(session.actionError).toMatchObject({
        name: 'selectPage',
        message: expect.stringMatching(/invalid request fields: language/),
      });
    });

    it('fails the initialization when the fields turn invalid before it is sent', async () => {
      let locale: Record<string, unknown> = {language: 'en', country: 'US', currency: 'USD'};
      const session = createPrivateSession(config(() => locale, {initialize: true}));
      locale = {};

      await flush();

      expect(callMock).not.toHaveBeenCalled();
      expect(session.initialization?.status).toBe('error');
    });
  });

  describe('client-owned keys', () => {
    const locale = {language: 'en', country: 'US', currency: 'USD'};

    it.each(CLIENT_OWNED_REQUEST_KEYS)('rejects fields that set %s', (key) => {
      expect(() => createPrivateSession(config(() => ({...locale, [key]: 'x'})))).toThrow(
        `can't set ${key}`
      );
    });

    it('rejects a schema whose output sets a client-owned key', () => {
      expect(() =>
        createPrivateSession({
          ...config(() => locale),
          request: {
            schema: localeSchema.transform((fields) => ({...fields, conversationToken: 'forged'})),
            fields: () => locale,
          },
        })
      ).toThrow("schema output can't set conversationToken");
    });

    it('fails the request when the fields set a client-owned key later', async () => {
      let fields: Record<string, unknown> = locale;
      const session = createPrivateSession(config(() => fields));
      fields = {...locale, message: 'forged', context: {}};

      await session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'find shoes'}});

      expect(callMock).not.toHaveBeenCalled();
      expect(session.turns[0].error).toMatch("can't set message, context");
    });
  });

  it('leaves the public createSession on its built-in contract', async () => {
    const session = createSession({
      contracts,
      organizationId: 'org-1',
      accessToken: 'token-1',
      agentConfigurationId: 'agent-configuration-1',
      trackingId: 'tracking-1',
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
        'message',
        'trackingId',
      ].sort()
    );
    expect(requests()[0]).toMatchObject({
      agentConfigurationId: 'agent-configuration-1',
      trackingId: 'tracking-1',
    });
  });
});
