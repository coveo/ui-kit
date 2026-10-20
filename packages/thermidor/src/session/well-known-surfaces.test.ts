import {beforeEach, describe, expect, it, vi} from 'vitest';

const callMock =
  vi.fn<
    (
      request: Record<string, unknown>,
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
import type {WellKnownSurfaceTemplate} from './well-known-surfaces.js';

const contracts = z.discriminatedUnion('component', [
  z.strictObject({
    component: z.literal('QuerySuggestions'),
    state: z
      .strictObject({
        query: z.string(),
        completions: z.array(z.strictObject({expression: z.string()})),
      })
      .optional(),
    actions: z
      .strictObject({
        fetchSuggestions: z.strictObject({payload: z.strictObject({query: z.string()})}),
      })
      .optional(),
  }),
]) as unknown as ContractsSchema;

const SearchBoxSurface: WellKnownSurfaceTemplate = {
  template: 'search-box',
  catalogId: 'catalog',
  components: [{id: 'root', component: 'QuerySuggestions'}],
  dataModel: {'/state/root': {query: '', completions: []}},
};

const config: SessionConfig = {
  contract: {
    components: contracts,
    wellKnownSurfaces: [SearchBoxSurface],
    lookupActions: {QuerySuggestions: ['fetchSuggestions']},
  },
  organizationId: 'org-1',
  accessToken: 'token-1',
};

const encoder = new TextEncoder();

function suggestionsStream(surfaceId: string, query: string): ReadableStream<Uint8Array> {
  const events = [
    {type: 'RUN_STARTED', threadId: 'lookup', runId: 'lookup-run'},
    {
      type: 'ACTIVITY_SNAPSHOT',
      activityType: 'a2ui-surface',
      messageId: 'lookup-suggestions',
      content: {
        messages: [
          {
            version: 'v1.0',
            updateDataModel: {
              surfaceId,
              path: '/state/root',
              value: {query, completions: [{expression: `${query} shoes`}]},
            },
          },
        ],
      },
    },
    {type: 'RUN_FINISHED', threadId: 'lookup', runId: 'lookup-run'},
  ];
  return new ReadableStream({
    start(controller) {
      for (const event of events) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      }
      controller.close();
    },
  });
}

function answerLookups(): void {
  callMock.mockImplementation(async (request) => {
    const action = request['action'] as {surfaceId: string; context: {query: string}};
    return {
      success: true,
      data: {stream: suggestionsStream(action.surfaceId, action.context.query)},
    };
  });
}

/** Queues a call that stays pending until aborted. */
function queuePendingLookup(): {aborted: () => boolean} {
  let signal: AbortSignal | undefined;
  callMock.mockImplementationOnce(
    (_request, _configuration, options) =>
      new Promise((resolve) => {
        signal = options?.signal;
        signal?.addEventListener('abort', () =>
          resolve({success: false, error: 'This operation was aborted'})
        );
      })
  );
  return {aborted: () => signal?.aborted === true};
}

function fetchSuggestions(surfaceId: string, query: string) {
  return {
    version: 'v0.9' as const,
    userAction: {name: 'fetchSuggestions', surfaceId, sourceComponentId: 'root', context: {query}},
  };
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('well-known surfaces', () => {
  beforeEach(() => {
    callMock.mockReset();
  });

  it('creates an instance under the given surface id before any request', () => {
    const session = createSession(config);

    const searchBox = session.createWellKnownSurface(SearchBoxSurface, {surfaceId: 'header'});

    expect(searchBox.surfaceId).toBe('header');
    expect(searchBox.messages[0]).toMatchObject({
      createSurface: {surfaceId: 'header', catalogId: 'catalog'},
    });
    expect(callMock).not.toHaveBeenCalled();
  });

  it('mints a distinct surface id for each instance created without one', () => {
    const session = createSession(config);

    const first = session.createWellKnownSurface(SearchBoxSurface);
    const second = session.createWellKnownSurface(SearchBoxSurface);

    expect(first.surfaceId).not.toBe(second.surfaceId);
  });

  it('refuses a template the contract does not declare, and a live surface id', () => {
    const session = createSession(config);
    session.createWellKnownSurface(SearchBoxSurface, {surfaceId: 'header'});

    expect(() =>
      session.createWellKnownSurface({...SearchBoxSurface, template: 'cart-badge'})
    ).toThrow(/cart-badge/);
    expect(() => session.createWellKnownSurface(SearchBoxSurface, {surfaceId: 'header'})).toThrow(
      /header/
    );
  });

  it('sends a lookup with its template name and applies its result to that instance only', async () => {
    answerLookups();
    const session = createSession(config);
    const header = session.createWellKnownSurface(SearchBoxSurface, {surfaceId: 'header'});
    const drawer = session.createWellKnownSurface(SearchBoxSurface, {surfaceId: 'drawer'});

    await session.dispatchAction(fetchSuggestions('header', 'red'));

    expect(callMock.mock.calls[0]![0]).toMatchObject({
      surfaceTemplate: 'search-box',
      action: {surfaceId: 'header', sourceComponentId: 'root', name: 'fetchSuggestions'},
    });
    expect(header.messages.at(-1)).toMatchObject({
      updateDataModel: {surfaceId: 'header', path: '/state/root', value: {query: 'red'}},
    });
    expect(drawer.messages).toHaveLength(header.messages.length - 1);
  });

  it('never lets a lookup on one instance abort a lookup on another', async () => {
    const header = queuePendingLookup();
    queuePendingLookup();
    const session = createSession(config);
    session.createWellKnownSurface(SearchBoxSurface, {surfaceId: 'header'});
    session.createWellKnownSurface(SearchBoxSurface, {surfaceId: 'drawer'});

    void session.dispatchAction(fetchSuggestions('header', 'r'));
    void session.dispatchAction(fetchSuggestions('drawer', 'b'));
    await flush();

    expect(header.aborted()).toBe(false);
  });

  it('aborts the previous lookup of the same instance', async () => {
    const first = queuePendingLookup();
    queuePendingLookup();
    const session = createSession(config);
    session.createWellKnownSurface(SearchBoxSurface, {surfaceId: 'header'});

    void session.dispatchAction(fetchSuggestions('header', 'r'));
    void session.dispatchAction(fetchSuggestions('header', 're'));
    await flush();

    expect(first.aborted()).toBe(true);
  });

  it('aborts the lookups of a disposed instance and frees its surface id', async () => {
    const lookup = queuePendingLookup();
    const session = createSession(config);
    const searchBox = session.createWellKnownSurface(SearchBoxSurface, {surfaceId: 'header'});
    void session.dispatchAction(fetchSuggestions('header', 'r'));
    await flush();

    searchBox.dispose();

    expect(lookup.aborted()).toBe(true);
    expect(() =>
      session.createWellKnownSurface(SearchBoxSurface, {surfaceId: 'header'})
    ).not.toThrow();
  });

  it('sends nothing for an action from a disposed instance', async () => {
    const session = createSession(config);
    session.createWellKnownSurface(SearchBoxSurface, {surfaceId: 'header'}).dispose();

    await session.dispatchAction(fetchSuggestions('header', 'r'));

    expect(callMock).not.toHaveBeenCalled();
  });
});
