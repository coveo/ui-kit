import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

/**
 * Unit tests for the session lifecycle.
 *
 * Covers the lifecycle guards and re-entry rules:
 *
 *   - cancel() during an in-flight stream stops consuming, retains the
 *     partial response already folded, and sets the active turn to `error`.
 *   - cancel() with nothing in flight is a no-op; turns unchanged.
 *   - a submitPrompt action opens a new turn, needs no active turn, and is
 *     ignored while a turn is streaming; turns unchanged.
 *   - while a turn is streaming, dispatchAction() is ignored; turns unchanged.
 *   - retry(turnId) on an `error` turn re-submits its input and sets the
 *     turn back to `streaming`.
 *   - retry with an unknown turnId, or a non-error turn, is a no-op.
 *
 * The session POSTs through `createUnifiedEndpointClient()` and folds the SSE
 * response into the active turn. To exercise the lifecycle without a real
 * network, the endpoint client is mocked with a fake whose `call` returns a
 * controllable {@link ControllableStream}: the test decides when the stream
 * emits activities and when it closes, so a turn can be held in `streaming`
 * indefinitely to probe the guards.
 */

const callMock = vi.fn<
  (
    request: unknown,
    configuration: unknown,
    options?: {signal?: AbortSignal}
  ) => Promise<
    | {success: true; data: {stream: ReadableStream<Uint8Array>}}
    | {
        success: false;
        error: string;
        conflict?: Record<string, never>;
      }
  >
>();

vi.mock('@/src/internal/api/unified/unified-endpoint-client.js', () => ({
  createUnifiedEndpointClient: () => ({call: callMock}),
}));

import {z} from 'zod/v4';
import type {ContractsSchema} from './contracts.js';
import {createSession, type SessionConfig} from './create-session.js';

/**
 * A locally-built A2-UI contract, INJECTED as test data exactly as a real
 * consumer would inject it. Built with this package's own Zod so the test is
 * independent of any concrete contract package. Mirrors the generated Coveo
 * shape: a discriminated union on `component` whose Pagination member carries
 * an optional strict `state` and `actions`.
 */
const PaginationSchema = z.strictObject({
  component: z.literal('Pagination'),
  state: z
    .strictObject({
      page: z.number().int().min(0),
      pageSize: z.number().int().min(1),
      totalEntries: z.number().int().min(0),
      totalPages: z.number().int().min(0),
    })
    .optional(),
  actions: z
    .strictObject({
      selectPage: z.strictObject({payload: z.strictObject({page: z.number().int().min(0)})}),
      setPageSize: z.strictObject({payload: z.strictObject({pageSize: z.number().int().min(1)})}),
    })
    .optional(),
});

const NextActionsBarSchema = z.strictObject({
  component: z.literal('NextActionsBar'),
  actions: z
    .strictObject({
      selectAction: z.strictObject({payload: z.strictObject({actionId: z.string()})}),
    })
    .optional(),
});

const contracts = z.discriminatedUnion('component', [
  PaginationSchema,
  NextActionsBarSchema,
]) as unknown as ContractsSchema;

/**
 * A ReadableStream a test can feed SSE activities into and close on demand,
 * modelling an in-flight stream that stays open until the test decides.
 */
interface ControllableStream {
  stream: ReadableStream<Uint8Array>;
  /** Pushes a single SSE-framed activity into the stream. */
  emit(activity: Record<string, unknown>): void;
  /** Closes the stream, ending the turn's consumption. */
  close(): void;
  /** Resolves once the endpoint client's `call` has been invoked and the reader is attached. */
  readonly opened: Promise<void>;
}

const encoder = new TextEncoder();

function sseFrame(activity: Record<string, unknown>): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify(activity)}\n\n`);
}

function createControllableStream(): ControllableStream {
  let controller!: ReadableStreamDefaultController<Uint8Array>;
  let markOpened!: () => void;
  const opened = new Promise<void>((resolve) => {
    markOpened = resolve;
  });

  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      controller = c;
    },
    pull() {
      // The first pull happens once the session attaches its reader; use it to
      // signal that the stream is being consumed.
      markOpened();
    },
    cancel() {
      markOpened();
    },
  });

  return {
    stream,
    emit(activity) {
      controller.enqueue(sseFrame(activity));
    },
    close() {
      try {
        controller.close();
      } catch {
        // Already closed (e.g. after a cancel); ignore.
      }
    },
    opened,
  };
}

/**
 * Queues a controllable stream as the result of the next `call`, returning the
 * handle so the test can drive it.
 */
function queueStream(): ControllableStream {
  const controllable = createControllableStream();
  callMock.mockImplementationOnce(async () => ({
    success: true,
    data: {stream: controllable.stream},
  }));
  return controllable;
}

const conflictError = 'Conflict: Another request is still being processed for this session.';

/** Queues a call that stays pending until aborted, then fails the way the client reports an abort. */
function queueAbortableCall(): void {
  callMock.mockImplementationOnce(
    (_request, _configuration, options) =>
      new Promise((resolve) => {
        options?.signal?.addEventListener('abort', () =>
          resolve({success: false, error: 'This operation was aborted'})
        );
      })
  );
}

/** Queues an `AGENT:ACTION_IN_FLIGHT` rejection as the result of the next `call`. */
function queueConflict(): void {
  callMock.mockImplementationOnce(async () => ({
    success: false,
    error: conflictError,
    conflict: {},
  }));
}

/** A completed surface carrying a Pagination node, so `selectPage` resolves a discriminant. */
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

const PAGE_ACTION = {
  component: 'Pagination',
  name: 'selectPage',
  surfaceId: 'commerce-search-surface',
  sourceComponentId: 'pagination-1',
};

function selectPageMessage(page: number) {
  return {
    userAction: {
      name: 'selectPage',
      surfaceId: 'commerce-search-surface',
      sourceComponentId: 'pagination-1',
      context: {page},
    },
  };
}

const baseConfig: SessionConfig = {
  contracts,
  organizationId: 'org-1',
  accessToken: 'token-1',
  initialize: false,
};

/** Waits for pending microtasks so folded state settles before assertions. */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('createSession lifecycle', () => {
  beforeEach(() => {
    callMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('submitPrompt action', () => {
    it('opens the first turn with no active turn and sends the prompt as a message', async () => {
      const session = createSession(baseConfig);

      const first = queueStream();
      const firstTurn = session.dispatchAction({
        name: 'submitPrompt',
        payload: {prompt: 'find shoes'},
      });
      await first.opened;

      expect(session.turns).toHaveLength(1);
      expect(session.turns[0].status).toBe('streaming');
      expect(session.turns[0].input.prompt).toBe('find shoes');
      expect(callMock.mock.calls[0][0]).toMatchObject({message: 'find shoes', action: null});

      first.emit({type: 'RUN_FINISHED'});
      first.close();
      await firstTurn;
      expect(session.turns[0].status).toBe('complete');
    });

    it('opens a follow-up turn that carries the Gateway session keys', async () => {
      const session = createSession(baseConfig);

      const first = queueStream();
      const firstTurn = session.dispatchAction({
        name: 'submitPrompt',
        payload: {prompt: 'find shoes'},
      });
      await first.opened;
      first.emit({
        type: 'RUN_STARTED',
        threadId: 'gateway-session-123',
        runId: 'gateway-run-123',
        conversationSessionId: 'gateway-session-123',
        conversationToken: 'gateway-token-abc',
      });
      first.emit({type: 'RUN_FINISHED'});
      first.close();
      await firstTurn;

      const followUp = queueStream();
      const followUpTurn = session.dispatchAction({
        name: 'submitPrompt',
        payload: {prompt: 'in red'},
      });
      await followUp.opened;
      followUp.emit({type: 'RUN_FINISHED'});
      followUp.close();
      await followUpTurn;

      expect(callMock).toHaveBeenCalledTimes(2);
      expect(callMock.mock.calls[1][0]).toMatchObject({
        message: 'in red',
        action: null,
        conversationSessionId: 'gateway-session-123',
        conversationToken: 'gateway-token-abc',
      });
      expect(session.turns.map((turn) => [turn.input.prompt, turn.status])).toEqual([
        ['find shoes', 'complete'],
        ['in red', 'complete'],
      ]);
    });
  });

  describe('a dispatch made while a request is in flight', () => {
    async function streamingPrompt(session: ReturnType<typeof createSession>) {
      const stream = queueStream();
      const turn = session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'first'}});
      await stream.opened;
      stream.emit(PAGINATION_SURFACE);
      await flush();
      return {stream, turn};
    }

    it('withholds a prompt, sending nothing and settling at once', async () => {
      const session = createSession(baseConfig);
      const {stream, turn} = await streamingPrompt(session);

      await session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'second'}});

      expect(callMock).toHaveBeenCalledTimes(1);
      expect(session.turns.map((candidate) => candidate.input.prompt)).toEqual(['first']);
      stream.emit({type: 'RUN_FINISHED'});
      stream.close();
      await turn;
    });

    it('withholds an action, sending nothing and settling at once', async () => {
      const session = createSession(baseConfig);
      const {stream, turn} = await streamingPrompt(session);

      await session.dispatchAction(selectPageMessage(2));

      expect(callMock).toHaveBeenCalledTimes(1);
      expect(session.request).toMatchObject({kind: 'prompt'});
      stream.emit({type: 'RUN_FINISHED'});
      stream.close();
      await turn;
    });
  });

  describe('Gateway session continuity', () => {
    it('reuses RUN_STARTED session metadata for the next action request', async () => {
      const session = createSession(baseConfig);

      const first = queueStream();
      const firstTurn = session.dispatchAction({
        name: 'submitPrompt',
        payload: {prompt: 'find shoes'},
      });
      await first.opened;
      first.emit({
        type: 'RUN_STARTED',
        threadId: 'gateway-session-123',
        runId: 'gateway-run-123',
        conversationSessionId: 'gateway-session-123',
        conversationToken: 'gateway-token-abc',
      });
      first.emit({
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
      });
      first.emit({type: 'RUN_FINISHED', threadId: 'gateway-session-123', runId: 'gateway-run-123'});
      first.close();
      await firstTurn;

      const actionStream = queueStream();
      const actionTurn = session.dispatchAction({
        userAction: {
          name: 'selectPage',
          surfaceId: 'commerce-search-surface',
          sourceComponentId: 'pagination-1',
          context: {page: 2},
        },
      });
      await flush();
      await actionStream.opened;

      expect(callMock).toHaveBeenCalledTimes(2);
      expect(callMock.mock.calls[1][0]).toMatchObject({
        conversationSessionId: 'gateway-session-123',
        conversationToken: 'gateway-token-abc',
      });

      actionStream.emit({type: 'RUN_FINISHED'});
      actionStream.close();
      await actionTurn;
    });
  });

  describe('dispatchAction preserves the originating surfaceId', () => {
    /**
     * An action must POST to ITS OWN originating surface
     * (`userAction.surfaceId`), not to whichever surface happens to be
     * CommerceSearch. Actions from conversation-only surfaces must reach their
     * own surface rather than being dropped or misrouted.
     */
    async function seedCompletedTurn(
      session: ReturnType<typeof createSession>,
      createSurface: Record<string, unknown>
    ) {
      const first = queueStream();
      const firstTurn = session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'go'}});
      await first.opened;
      first.emit({
        type: 'ACTIVITY_SNAPSHOT',
        messageId: 'surface-activity',
        activityType: 'a2ui-surface',
        content: {messages: [{version: 'v1.0', createSurface}]},
      });
      first.emit({type: 'RUN_FINISHED'});
      first.close();
      await firstTurn;
    }

    it('routes an action from a conversation-only surface to that surface (was dropped)', async () => {
      const session = createSession(baseConfig);
      await seedCompletedTurn(session, {
        surfaceId: 'next-actions-surface',
        components: [
          {id: 'root', component: 'NextActionsBar'},
          {id: 'next-1', component: 'NextActionsBar'},
        ],
      });

      const actionStream = queueStream();
      const actionTurn = session.dispatchAction({
        userAction: {
          name: 'selectAction',
          surfaceId: 'next-actions-surface',
          sourceComponentId: 'next-1',
          context: {actionId: 'a-42'},
        },
      });
      await flush();
      await actionStream.opened;

      // The action reaches the endpoint even when no CommerceSearch surface
      // exists on the active turn.
      expect(callMock).toHaveBeenCalledTimes(2);
      expect(callMock.mock.calls[1][0]).toMatchObject({
        action: {surfaceId: 'next-actions-surface', name: 'selectAction'},
      });

      actionStream.emit({type: 'RUN_FINISHED'});
      actionStream.close();
      await actionTurn;
    });

    it('routes a conversation-only action to its own surface, not the commerce one', async () => {
      const session = createSession(baseConfig);
      // A turn with BOTH a CommerceSearch surface and a conversation-only one.
      const first = queueStream();
      const firstTurn = session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'go'}});
      await first.opened;
      first.emit({
        type: 'ACTIVITY_SNAPSHOT',
        messageId: 'surface-commerce',
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
      });
      first.emit({
        type: 'ACTIVITY_SNAPSHOT',
        messageId: 'surface-next',
        activityType: 'a2ui-surface',
        content: {
          messages: [
            {
              version: 'v1.0',
              createSurface: {
                surfaceId: 'next-actions-surface',
                components: [{id: 'root', component: 'NextActionsBar'}],
              },
            },
          ],
        },
      });
      first.emit({type: 'RUN_FINISHED'});
      first.close();
      await firstTurn;

      const actionStream = queueStream();
      const actionTurn = session.dispatchAction({
        userAction: {
          name: 'selectAction',
          surfaceId: 'next-actions-surface',
          sourceComponentId: 'root',
          context: {actionId: 'a-7'},
        },
      });
      await flush();
      await actionStream.opened;

      // Routed to its OWN surface, not the CommerceSearch one.
      expect(callMock.mock.calls[1][0]).toMatchObject({
        action: {surfaceId: 'next-actions-surface'},
      });

      actionStream.emit({type: 'RUN_FINISHED'});
      actionStream.close();
      await actionTurn;
    });

    it('drops an action whose (surfaceId, node) is absent from the active turn', async () => {
      const session = createSession(baseConfig);
      await seedCompletedTurn(session, {
        surfaceId: 'commerce-search-surface',
        components: [
          {id: 'root', component: 'CommerceSearch'},
          {id: 'pagination-1', component: 'Pagination'},
        ],
      });

      // A surfaceId that does not exist on the active turn: recoverDiscriminant
      // finds no registry entry → nothing sent (drop upstream of executeAction).
      const dispatched = session.dispatchAction({
        userAction: {
          name: 'selectPage',
          surfaceId: 'ghost-surface',
          sourceComponentId: 'pagination-1',
          context: {page: 2},
        },
      });
      await flush();
      await dispatched;

      // Only the initial prompt reached the endpoint; the action was dropped.
      expect(callMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('session-scoped surfaces (ADR-018)', () => {
    const surfaceSnapshot = (messageId: string, messages: unknown[]) => ({
      type: 'ACTIVITY_SNAPSHOT',
      messageId,
      activityType: 'a2ui-surface',
      content: {messages},
    });
    const searchSurface = surfaceSnapshot('search', [
      {
        version: 'v1.0',
        createSurface: {
          surfaceId: 'commerce-search-surface',
          catalogId: 'catalog',
          components: [
            {id: 'root', component: 'CommerceSearch'},
            {id: 'pagination-1', component: 'Pagination'},
          ],
        },
      },
    ]);
    const answerSurface = surfaceSnapshot('answer', [
      {
        version: 'v1.0',
        createSurface: {
          surfaceId: 'answer-surface',
          catalogId: 'catalog',
          components: [{id: 'root', component: 'NextActionsBar'}],
        },
      },
    ]);
    const pagination = {page: 1, pageSize: 24, totalEntries: 100, totalPages: 5};

    async function prompt(session: ReturnType<typeof createSession>, ...events: object[]) {
      const stream = queueStream();
      const turn = session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'go'}});
      await stream.opened;
      for (const event of events) {
        stream.emit(event as Record<string, unknown>);
      }
      stream.emit({type: 'RUN_FINISHED'});
      stream.close();
      await turn;
    }

    it('lists every live surface, and narrows each turn to the ones it created', async () => {
      const session = createSession(baseConfig);
      await prompt(session, searchSurface);
      await prompt(session, answerSurface);

      expect(session.surfaces.map((surface) => surface.surfaceId)).toEqual([
        'commerce-search-surface',
        'answer-surface',
      ]);
      expect(
        session.turns.map((turn) => turn.response.surfaces.map((surface) => surface.surfaceId))
      ).toEqual([['commerce-search-surface'], ['answer-surface']]);
    });

    it('sends an action from a surface an earlier turn created', async () => {
      const session = createSession(baseConfig);
      await prompt(session, searchSurface);
      await prompt(session, answerSurface);

      const stream = queueStream();
      const action = session.dispatchAction(selectPageMessage(2));
      await stream.opened;

      expect(callMock.mock.calls[2][0]).toMatchObject({
        action: {surfaceId: 'commerce-search-surface', name: 'selectPage'},
      });
      stream.emit({type: 'RUN_FINISHED'});
      stream.close();
      await action;
    });

    it('applies a later turn validated write to the state of an earlier surface', async () => {
      const session = createSession(baseConfig);
      await prompt(session, searchSurface);
      await prompt(
        session,
        surfaceSnapshot('update', [
          {
            version: 'v1.0',
            updateDataModel: {
              surfaceId: 'commerce-search-surface',
              path: '/state/pagination-1',
              value: pagination,
            },
          },
        ])
      );

      expect(session.state).toEqual({
        'commerce-search-surface': {state: {'pagination-1': pagination}},
      });
    });

    const paginationWrite = surfaceSnapshot('write', [
      {
        version: 'v1.0',
        updateDataModel: {
          surfaceId: 'commerce-search-surface',
          path: '/state/pagination-1',
          value: pagination,
        },
      },
    ]);

    it('keeps a placeholder its turn left behind out while an action streams into that turn', async () => {
      const session = createSession(baseConfig);
      await prompt(
        session,
        searchSurface,
        surfaceSnapshot('placeholder', [
          {
            version: 'v1.0',
            createSurface: {
              surfaceId: 'carousel-placeholder',
              catalogId: 'catalog',
              components: [{id: 'root', component: 'ProductCarousel'}],
              dataModel: {isLoading: true},
            },
          },
        ])
      );

      const stream = queueStream();
      const action = session.dispatchAction(selectPageMessage(2));
      await stream.opened;
      const during = session.surfaces.map((surface) => surface.surfaceId);
      stream.emit({type: 'RUN_FINISHED'});
      stream.close();
      await action;

      expect(during).toEqual(['commerce-search-surface']);
      expect(session.surfaces.map((surface) => surface.surfaceId)).toEqual([
        'commerce-search-surface',
      ]);
    });

    it('starts a surface re-created under a live id with an empty state', async () => {
      const session = createSession(baseConfig);
      await prompt(session, searchSurface, paginationWrite);
      await prompt(session, surfaceSnapshot('recreate', searchSurface.content.messages));

      expect(session.state).toEqual({});
    });

    it('persists no state for a deleted surface', async () => {
      const session = createSession(baseConfig);
      await prompt(session, searchSurface, paginationWrite);
      await prompt(
        session,
        surfaceSnapshot('delete', [
          {version: 'v1.0', deleteSurface: {surfaceId: 'commerce-search-surface'}},
        ])
      );

      expect(session.serialize().state?.['commerce-search-surface']).toBeUndefined();
    });

    it('only grows its renderer stream', async () => {
      const session = createSession(baseConfig);
      const streams: (readonly unknown[])[] = [];
      session.subscribe(() => streams.push(session.a2uiMessages));

      await prompt(session, searchSurface);
      await prompt(session, answerSurface);

      for (let index = 1; index < streams.length; index++) {
        expect(streams[index].slice(0, streams[index - 1].length)).toEqual(streams[index - 1]);
      }
      expect(
        session.a2uiMessages
          .map((message) => (message['createSurface'] as {surfaceId?: string})?.surfaceId)
          .filter(Boolean)
      ).toEqual(['commerce-search-surface', 'answer-surface']);
    });

    it('leaves the active turn as it is when an action on an earlier surface fails', async () => {
      const session = createSession(baseConfig);
      await prompt(session, searchSurface);
      await prompt(session, answerSurface);
      callMock.mockImplementationOnce(async () => ({success: false, error: 'Bad gateway'}));

      await session.dispatchAction(selectPageMessage(2));

      expect(session.turns.map((turn) => turn.status)).toEqual(['complete', 'complete']);
      expect(session.actionError).toEqual({message: 'Bad gateway', ...PAGE_ACTION});
    });

    it('leaves the active turn as it is when an action on an earlier surface streams an error', async () => {
      const session = createSession(baseConfig);
      await prompt(session, searchSurface);
      await prompt(session, answerSurface);

      const stream = queueStream();
      const action = session.dispatchAction(selectPageMessage(2));
      await stream.opened;
      stream.emit({type: 'RUN_ERROR', message: 'Search failed'});
      stream.close();
      await action;

      expect(session.turns.map((turn) => turn.status)).toEqual(['complete', 'complete']);
      expect(session.actionError).toEqual({message: 'Search failed', ...PAGE_ACTION});
    });

    it('leaves the active turn as it is when an action on an earlier surface ends without a terminal event', async () => {
      const session = createSession(baseConfig);
      await prompt(session, searchSurface);
      await prompt(session, answerSurface);

      const stream = queueStream();
      const action = session.dispatchAction(selectPageMessage(2));
      await stream.opened;
      stream.close();
      await action;

      expect(session.turns.map((turn) => turn.status)).toEqual(['complete', 'complete']);
      expect(session.actionError).toEqual({
        message: 'Stream ended without a terminal event.',
        ...PAGE_ACTION,
      });
    });

    it('leaves the active turn as it is when building an action on an earlier surface throws', async () => {
      let throwing = false;
      const session = createSession({
        ...baseConfig,
        commerceContextProvider: () => {
          if (throwing) {
            throw new Error('No cart');
          }
          return {cart: []};
        },
      });
      await prompt(session, searchSurface);
      await prompt(session, answerSurface);
      throwing = true;

      await session.dispatchAction(selectPageMessage(2));

      expect(session.turns.map((turn) => turn.status)).toEqual(['complete', 'complete']);
      expect(session.actionError).toEqual({message: 'No cart', ...PAGE_ACTION});
    });

    async function cancelledPrompt(session: ReturnType<typeof createSession>) {
      const stream = queueStream();
      const turn = session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'cut'}});
      await stream.opened;
      session.cancel();
      await turn;
    }

    it('keeps a prompt turn cancelled when cancelled while awaiting data', async () => {
      const session = createSession(baseConfig);
      const stream = queueStream();
      const turn = session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'cut'}});
      await stream.opened;
      stream.emit({type: 'RUN_STARTED'});
      await flush();

      session.cancel();
      await turn;

      expect(session.turns[0]).toMatchObject({status: 'error', error: 'Cancelled'});
    });

    it('leaves a failed active turn failed when an action on an earlier surface finishes', async () => {
      const session = createSession(baseConfig);
      await prompt(session, searchSurface);
      await cancelledPrompt(session);
      const failedTurnId = session.turns[1].id;

      const stream = queueStream();
      const action = session.dispatchAction(selectPageMessage(2));
      await stream.opened;
      stream.emit({type: 'RUN_STARTED'});
      stream.emit(
        surfaceSnapshot('page', [
          {
            version: 'v1.0',
            updateDataModel: {
              surfaceId: 'commerce-search-surface',
              path: '/state/pagination-1',
              value: pagination,
            },
          },
        ])
      );
      stream.emit({type: 'RUN_FINISHED'});
      stream.close();
      await action;

      expect(session.turns.map((turn) => turn.status)).toEqual(['complete', 'error']);
      expect(session.turns[1].error).toBe('Cancelled');
      expect(session.actionError).toBeUndefined();
      expect(session.state).toEqual({
        'commerce-search-surface': {state: {'pagination-1': pagination}},
      });

      const retried = queueStream();
      session.retry(failedTurnId);
      await retried.opened;
      expect(session.turns[1].status).toBe('streaming');
      retried.emit({type: 'RUN_FINISHED'});
      retried.close();
      await flush();
    });

    it('leaves a failed turn failed when an action on its own block finishes', async () => {
      const session = createSession(baseConfig);
      const first = queueStream();
      const turn = session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'go'}});
      await first.opened;
      first.emit(searchSurface);
      first.emit({type: 'RUN_ERROR', message: 'Agent crashed'});
      first.close();
      await turn;

      const stream = queueStream();
      const action = session.dispatchAction(selectPageMessage(2));
      await stream.opened;
      stream.emit({type: 'RUN_FINISHED'});
      stream.close();
      await action;

      expect(session.turns[0]).toMatchObject({status: 'error', error: 'Agent crashed'});
      const retried = queueStream();
      session.retry(session.turns[0].id);
      await retried.opened;
      expect(session.turns[0].status).toBe('streaming');
      retried.emit({type: 'RUN_FINISHED'});
      retried.close();
      await flush();
    });

    it('reports a failed action on a block of the active turn without failing the turn', async () => {
      const session = createSession(baseConfig);
      await prompt(session, searchSurface);
      callMock.mockImplementationOnce(async () => ({success: false, error: 'Bad gateway'}));

      await session.dispatchAction(selectPageMessage(2));

      expect(session.turns[0].status).toBe('complete');
      expect(session.actionError).toEqual({message: 'Bad gateway', ...PAGE_ACTION});
    });

    it('keeps the text of an action on an earlier surface out of the active turn', async () => {
      const session = createSession(baseConfig);
      await prompt(session, searchSurface);
      await prompt(session, answerSurface);

      const stream = queueStream();
      const action = session.dispatchAction(selectPageMessage(2));
      await stream.opened;
      stream.emit({type: 'TEXT_MESSAGE_START', messageId: 'm1', role: 'assistant'});
      stream.emit({type: 'TEXT_MESSAGE_CONTENT', messageId: 'm1', delta: 'page two'});
      stream.emit({type: 'RUN_FINISHED'});
      stream.close();
      await action;

      expect(session.turns[1].response.agent).toBeUndefined();
      expect(session.turns.map((turn) => turn.status)).toEqual(['complete', 'complete']);
    });
  });

  describe('snapshot', () => {
    it('returns the same frozen snapshot until the session state changes', () => {
      const session = createSession(baseConfig);

      const snapshot = session.getSnapshot();

      expect(session.getSnapshot()).toBe(snapshot);
      expect(Object.isFrozen(snapshot)).toBe(true);
      expect(snapshot).toEqual({
        turns: [],
        initialization: undefined,
        surfaces: [],
        a2uiMessages: [],
        state: {},
        request: undefined,
        actionError: undefined,
      });
    });

    it('holds what the session members hold, and is replaced as they change', async () => {
      const session = createSession(baseConfig);
      const {getSnapshot, subscribe} = session;
      const snapshots: ReturnType<typeof getSnapshot>[] = [];
      const unsubscribe = subscribe(() => {
        const snapshot = getSnapshot();
        if (snapshots.at(-1) !== snapshot) {
          snapshots.push(snapshot);
        }
      });

      const stream = queueStream();
      const turn = session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'shoes'}});
      await stream.opened;
      const streaming = getSnapshot();
      expect(streaming.turns).toBe(session.turns);
      expect(streaming.a2uiMessages).toBe(session.a2uiMessages);
      expect(streaming.request).toBe(session.request);

      stream.emit({type: 'RUN_FINISHED'});
      stream.close();
      await turn;
      unsubscribe();

      expect(getSnapshot().request).toBeUndefined();
      expect(getSnapshot().turns[0].status).toBe('complete');
      expect(new Set(snapshots).size).toBe(snapshots.length);
    });
  });

  describe('action request', () => {
    it('names the component that dispatched the action', async () => {
      const session = createSession(baseConfig);
      const search = queueStream();
      const turn = session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'shoes'}});
      await search.opened;
      search.emit(PAGINATION_SURFACE);
      search.emit({type: 'RUN_FINISHED'});
      search.close();
      await turn;

      const stream = queueStream();
      const action = session.dispatchAction(selectPageMessage(2));
      await stream.opened;

      expect(session.request).toEqual({
        kind: 'action',
        component: 'Pagination',
        name: 'selectPage',
        surfaceId: 'commerce-search-surface',
        sourceComponentId: 'pagination-1',
        turnId: session.turns[0].id,
      });
      stream.emit({type: 'RUN_FINISHED'});
      stream.close();
      await action;
    });
  });

  describe('actions that open a turn', () => {
    // The producer announces the turn-opening actions of the bar in the event metadata (ADR-019).
    const NEXT_ACTIONS_SURFACE = {
      type: 'ACTIVITY_SNAPSHOT',
      messageId: 'next-actions',
      activityType: 'a2ui-surface',
      metadata: {turnOpeningActions: {'next-actions-surface': ['selectAction']}},
      content: {
        messages: [
          {
            version: 'v1.0',
            createSurface: {
              surfaceId: 'next-actions-surface',
              components: [{id: 'root', component: 'NextActionsBar'}],
            },
          },
        ],
      },
    };

    const followUp = {
      userAction: {
        name: 'selectAction',
        surfaceId: 'next-actions-surface',
        sourceComponentId: 'root',
        context: {actionId: 'more-jackets'},
      },
    };

    async function answeredPrompt(session: ReturnType<typeof createSession>) {
      const stream = queueStream();
      const turn = session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'jackets'}});
      await stream.opened;
      stream.emit(NEXT_ACTIONS_SURFACE);
      stream.emit({type: 'RUN_FINISHED'});
      stream.close();
      await turn;
    }

    it('keeps an action the producer does not announce in the active turn', async () => {
      const session = createSession(baseConfig);
      const prompt = queueStream();
      const turn = session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'jackets'}});
      await prompt.opened;
      const {metadata: _, ...unannounced} = NEXT_ACTIONS_SURFACE;
      prompt.emit(unannounced);
      prompt.emit({type: 'RUN_FINISHED'});
      prompt.close();
      await turn;

      const stream = queueStream();
      const sent = session.dispatchAction(followUp);
      await stream.opened;
      stream.emit({type: 'RUN_FINISHED'});
      stream.close();
      await sent;

      expect(session.turns).toHaveLength(1);
    });

    it('opens a new streaming turn that records the action', async () => {
      const session = createSession(baseConfig);
      await answeredPrompt(session);

      const stream = queueStream();
      const sent = session.dispatchAction(followUp);
      await stream.opened;

      const [first, opened] = session.turns;
      expect(session.turns).toHaveLength(2);
      expect(first.status).toBe('complete');
      expect(opened.status).toBe('streaming');
      expect(opened.input).toEqual({
        action: {
          component: 'NextActionsBar',
          name: 'selectAction',
          surfaceId: 'next-actions-surface',
          sourceComponentId: 'root',
          context: {actionId: 'more-jackets'},
        },
      });
      expect(session.request).toMatchObject({
        kind: 'action',
        component: 'NextActionsBar',
        turnId: opened.id,
      });
      expect(callMock.mock.calls[1][0]).toMatchObject({
        message: null,
        action: {surfaceId: 'next-actions-surface', name: 'selectAction'},
      });

      stream.emit({type: 'TEXT_MESSAGE_START', messageId: 'm', role: 'assistant'});
      stream.emit({type: 'TEXT_MESSAGE_CONTENT', messageId: 'm', delta: 'More jackets'});
      stream.emit({type: 'RUN_FINISHED'});
      stream.close();
      await sent;

      expect(session.turns[1].status).toBe('complete');
      expect(session.turns[1].response.agent?.messages[0].content).toBe('More jackets');
      expect(session.turns[0].response.agent).toBeUndefined();
    });

    it('still sends an action from the turn the follow-up was sent from', async () => {
      const session = createSession(baseConfig);
      await answeredPrompt(session);
      const stream = queueStream();
      const sent = session.dispatchAction(followUp);
      await stream.opened;
      stream.emit({type: 'RUN_FINISHED'});
      stream.close();
      await sent;

      const again = queueStream();
      const sentAgain = session.dispatchAction(followUp);
      await again.opened;
      again.emit({type: 'RUN_FINISHED'});
      again.close();
      await sentAgain;

      expect(callMock).toHaveBeenCalledTimes(3);
      expect(session.turns).toHaveLength(3);
    });

    it('fails only its own turn when the action fails', async () => {
      const session = createSession(baseConfig);
      await answeredPrompt(session);
      callMock.mockImplementationOnce(async () => ({success: false, error: 'Bad gateway'}));

      await session.dispatchAction(followUp);

      expect(session.turns.map((turn) => [turn.status, turn.error])).toEqual([
        ['complete', undefined],
        ['error', 'Bad gateway'],
      ]);
    });

    it('marks its own turn as cancelled when cancelled', async () => {
      const session = createSession(baseConfig);
      await answeredPrompt(session);
      const stream = queueStream();
      const sent = session.dispatchAction(followUp);
      await stream.opened;

      session.cancel();
      stream.close();
      await sent;

      expect(session.turns.map((turn) => [turn.status, turn.error])).toEqual([
        ['complete', undefined],
        ['error', 'Cancelled'],
      ]);
    });

    it('sends the action again from its surface on retry', async () => {
      const session = createSession(baseConfig);
      await answeredPrompt(session);
      const failed = queueStream();
      const sent = session.dispatchAction(followUp);
      await failed.opened;
      failed.emit({type: 'RUN_ERROR', message: 'agent failed'});
      failed.close();
      await sent;
      const openedId = session.turns[1].id;
      expect(session.turns[1].status).toBe('error');

      const retried = queueStream();
      session.retry(openedId);
      await retried.opened;

      expect(session.turns[1]).toMatchObject({id: openedId, status: 'streaming'});
      expect(callMock.mock.calls.at(-1)?.[0]).toMatchObject({
        message: null,
        action: {
          surfaceId: 'next-actions-surface',
          name: 'selectAction',
          sourceComponentId: 'root',
          context: {actionId: 'more-jackets'},
        },
      });
      retried.emit({type: 'RUN_FINISHED'});
      retried.close();
      await flush();
      expect(session.turns[1].status).toBe('complete');
    });

    it('keeps the action that opened a turn through serialization', async () => {
      const session = createSession(baseConfig);
      await answeredPrompt(session);
      const stream = queueStream();
      const sent = session.dispatchAction(followUp);
      await stream.opened;
      stream.emit({type: 'RUN_FINISHED'});
      stream.close();
      await sent;

      const restored = createSession({...baseConfig, sessionToRestore: session.serialize()});

      expect(restored.turns[1].input).toEqual(session.turns[1].input);
    });
  });

  describe('cancel during an in-flight stream', () => {
    it('stops the stream, retains the partial response, and sets the active turn to error', async () => {
      const session = createSession(baseConfig);

      const first = queueStream();
      const submitPromise = session.dispatchAction({
        name: 'submitPrompt',
        payload: {prompt: 'find shoes'},
      });
      await first.opened;

      // Fold a partial response before cancelling.
      first.emit({type: 'TEXT_MESSAGE_START', messageId: 'm1', role: 'assistant'});
      first.emit({type: 'TEXT_MESSAGE_CONTENT', messageId: 'm1', delta: 'partial'});
      await flush();

      expect(session.turns[0].response.agent?.messages).toEqual([
        {content: 'partial', role: 'assistant'},
      ]);
      expect(session.turns[0].status).toBe('streaming');

      session.cancel();
      await submitPromise;

      const turn = session.turns[0];
      expect(turn.status).toBe('error');
      expect(turn.error).toBeDefined();
      // Partial response already folded is retained.
      expect(turn.response.agent?.messages).toEqual([{content: 'partial', role: 'assistant'}]);
    });
  });

  describe('cancel with nothing in flight', () => {
    it('is a no-op when no turns exist', () => {
      const session = createSession(baseConfig);

      expect(session.turns).toEqual([]);
      session.cancel();
      expect(session.turns).toEqual([]);
      expect(callMock).not.toHaveBeenCalled();
    });

    it('is a no-op after the active turn has completed, leaving turns unchanged', async () => {
      const session = createSession(baseConfig);

      const first = queueStream();
      const submitPromise = session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'hi'}});
      await first.opened;
      first.emit({type: 'RUN_FINISHED'});
      first.close();
      await submitPromise;

      const completedTurn = session.turns[0];
      expect(completedTurn.status).toBe('complete');

      session.cancel();

      expect(session.turns).toHaveLength(1);
      expect(session.turns[0]).toBe(completedTurn);
      expect(session.turns[0].status).toBe('complete');
    });
  });

  describe('retry on an error turn', () => {
    it('re-submits the errored turn input and sets its status to streaming', async () => {
      const session = createSession(baseConfig);

      // Drive the first turn to `error` via cancel.
      const first = queueStream();
      const submitPromise = session.dispatchAction({
        name: 'submitPrompt',
        payload: {prompt: 'find shoes'},
      });
      await first.opened;
      session.cancel();
      await submitPromise;

      const erroredTurn = session.turns[0];
      const turnId = erroredTurn.id;
      expect(erroredTurn.status).toBe('error');

      // Retry re-drives a stream carrying the original input.
      const retryStream = queueStream();
      session.retry(turnId);
      await retryStream.opened;

      expect(callMock).toHaveBeenCalledTimes(2);
      const retriedTurn = session.turns.find((turn) => turn.id === turnId);
      expect(retriedTurn?.status).toBe('streaming');
      expect(retriedTurn?.input.prompt).toBe('find shoes');
      // The re-submitted request carried the original prompt.
      const lastRequest = callMock.mock.calls[1][0] as {message: string | null};
      expect(lastRequest.message).toBe('find shoes');

      retryStream.emit({type: 'RUN_FINISHED'});
      retryStream.close();
      await flush();
    });

    async function erroredTurnId(session: ReturnType<typeof createSession>) {
      const first = queueStream();
      const submit = session.dispatchAction({
        name: 'submitPrompt',
        payload: {prompt: 'find shoes'},
      });
      await first.opened;
      session.cancel();
      await submit;
      return session.turns[0].id;
    }

    it('sends the turn once when retry() is called twice before it runs', async () => {
      const session = createSession(baseConfig);
      const turnId = await erroredTurnId(session);

      const retryStream = queueStream();
      session.retry(turnId);
      session.retry(turnId);
      await retryStream.opened;
      retryStream.emit({type: 'RUN_FINISHED'});
      retryStream.close();
      await flush();
      await flush();

      expect(callMock).toHaveBeenCalledTimes(2);
      expect(session.turns[0].status).toBe('complete');
      expect(session.request).toBeUndefined();
    });
  });

  describe('retry no-op cases', () => {
    it('is a no-op for an unknown turnId and leaves turns unchanged', () => {
      const session = createSession(baseConfig);

      session.retry('does-not-exist');

      expect(session.turns).toEqual([]);
      expect(callMock).not.toHaveBeenCalled();
    });

    it('is a no-op for a completed (non-error) turn and leaves its status unchanged', async () => {
      const session = createSession(baseConfig);

      const first = queueStream();
      const submitPromise = session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'hi'}});
      await first.opened;
      first.emit({type: 'RUN_FINISHED'});
      first.close();
      await submitPromise;

      const completedTurn = session.turns[0];
      expect(completedTurn.status).toBe('complete');

      session.retry(completedTurn.id);

      // No re-submission occurred and the turn is untouched.
      expect(callMock).toHaveBeenCalledTimes(1);
      expect(session.turns).toHaveLength(1);
      expect(session.turns[0].status).toBe('complete');
    });

    it('is a no-op for an errored turn that is no longer the last one', async () => {
      const session = createSession(baseConfig);
      const first = queueStream();
      const failed = session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'first'}});
      await first.opened;
      session.cancel();
      await failed;
      const next = queueStream();
      const nextTurn = session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'second'}});
      await next.opened;
      next.emit({type: 'RUN_FINISHED'});
      next.close();
      await nextTurn;

      session.retry(session.turns[0].id);
      await flush();

      expect(callMock).toHaveBeenCalledTimes(2);
      expect(session.turns.map((turn) => turn.status)).toEqual(['error', 'complete']);
    });
  });

  describe('a context provider that throws while the request is built', () => {
    /** A session whose commerce context provider throws while `failing` is set. */
    function createSessionWithFlakyProvider() {
      const provider = {failing: true};
      const session = createSession({
        ...baseConfig,
        commerceContextProvider: () => {
          if (provider.failing) {
            throw new Error('boom');
          }
          return {cart: []};
        },
      });
      return {session, provider};
    }

    it('fails the prompt turn without sending, and the next prompt still goes through', async () => {
      const {session, provider} = createSessionWithFlakyProvider();

      await expect(
        session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'first'}})
      ).resolves.toBeUndefined();

      expect(callMock).not.toHaveBeenCalled();
      expect(session.turns).toHaveLength(1);
      expect(session.turns[0].status).toBe('error');
      expect(session.turns[0].error).toBe('boom');

      provider.failing = false;
      const next = queueStream();
      const nextTurn = session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'second'}});
      await next.opened;

      expect(callMock).toHaveBeenCalledTimes(1);
      expect(session.turns).toHaveLength(2);
      expect(session.turns[1].status).toBe('streaming');

      next.emit({type: 'RUN_FINISHED'});
      next.close();
      await nextTurn;
    });

    it('fails a retried turn again while the provider keeps throwing', async () => {
      const {session} = createSessionWithFlakyProvider();
      await session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'find shoes'}});
      const turnId = session.turns[0].id;

      session.retry(turnId);
      await flush();

      expect(callMock).not.toHaveBeenCalled();
      expect(session.turns[0].status).toBe('error');
      expect(session.turns[0].error).toBe('boom');
    });

    it('lets retry re-drive the failed turn once the provider recovers', async () => {
      const {session, provider} = createSessionWithFlakyProvider();
      await session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'find shoes'}});
      const turnId = session.turns[0].id;

      provider.failing = false;
      const retryStream = queueStream();
      session.retry(turnId);
      await retryStream.opened;

      expect(session.turns[0].status).toBe('streaming');
      expect(callMock.mock.calls[0][0]).toMatchObject({message: 'find shoes', action: null});

      retryStream.emit({type: 'RUN_FINISHED'});
      retryStream.close();
      await flush();
      expect(session.turns[0].status).toBe('complete');
    });

    it('reports an action whose request throws while it is built, sending nothing', async () => {
      const {session, provider} = createSessionWithFlakyProvider();
      provider.failing = false;

      const first = queueStream();
      const firstTurn = session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'go'}});
      await first.opened;
      first.emit({
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
      });
      first.emit({type: 'RUN_FINISHED'});
      first.close();
      await firstTurn;

      provider.failing = true;
      await expect(
        session.dispatchAction({
          userAction: {
            name: 'selectPage',
            surfaceId: 'commerce-search-surface',
            sourceComponentId: 'pagination-1',
            context: {page: 2},
          },
        })
      ).resolves.toBeUndefined();

      expect(callMock).toHaveBeenCalledTimes(1);
      expect(session.turns[0].status).toBe('complete');
      expect(session.actionError).toEqual({message: 'boom', ...PAGE_ACTION});
    });
  });

  describe('request state', () => {
    async function seededSession() {
      const session = createSession(baseConfig);
      const seed = queueStream();
      const seedTurn = session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'go'}});
      await seed.opened;
      seed.emit(PAGINATION_SURFACE);
      seed.emit({type: 'RUN_FINISHED'});
      seed.close();
      await seedTurn;
      return session;
    }

    it('exposes the request being sent until it ends', async () => {
      const session = createSession(baseConfig);
      expect(session.request).toBeUndefined();

      const stream = queueStream();
      const turn = session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'go'}});
      expect(session.request).toEqual({kind: 'prompt', turnId: expect.any(String)});

      await stream.opened;
      stream.emit({type: 'RUN_FINISHED'});
      stream.close();
      await turn;

      expect(session.request).toBeUndefined();
    });

    it('never shows a withheld dispatch as the request in flight', async () => {
      const session = await seededSession();
      const seen: unknown[] = [];
      session.subscribe(() => seen.push(session.request));

      await session.dispatchAction({
        userAction: {name: 'selectPage', surfaceId: 'commerce-search-surface', context: {}},
      });

      expect(seen).toEqual([]);
    });

    it('does not send a request cancelled by a listener as it is published', async () => {
      const session = await seededSession();
      const unsubscribe = session.subscribe(() => {
        if (session.request) {
          session.cancel();
        }
      });

      await session.dispatchAction(selectPageMessage(2));
      unsubscribe();

      expect(callMock).toHaveBeenCalledTimes(1);
      expect(session.request).toBeUndefined();
    });

    it('sends a dispatch made by a listener as the session goes idle', async () => {
      const session = await seededSession();
      const first = queueStream();
      const second = queueStream();
      let followUp: Promise<void> | undefined;
      const unsubscribe = session.subscribe(() => {
        if (!session.request && !followUp) {
          followUp = session.dispatchAction(selectPageMessage(3));
        }
      });

      const firstAction = session.dispatchAction(selectPageMessage(2));
      await first.opened;
      first.emit({type: 'RUN_FINISHED'});
      first.close();
      await firstAction;
      unsubscribe();

      expect(session.request).toEqual(
        expect.objectContaining({kind: 'action', name: 'selectPage'})
      );
      await second.opened;
      second.emit({type: 'RUN_FINISHED'});
      second.close();
      await followUp;

      expect(callMock).toHaveBeenCalledTimes(3);
      expect(session.request).toBeUndefined();
    });
  });

  describe('Gateway rejects a request as concurrent (409 AGENT:ACTION_IN_FLIGHT)', () => {
    const actionMessage = (page: number) => ({
      userAction: {
        name: 'selectPage',
        surfaceId: 'commerce-search-surface',
        sourceComponentId: 'pagination-1',
        context: {page},
      },
    });

    /** Completes a first turn carrying a Pagination surface, so `selectPage` can be issued. */
    async function seedSession() {
      const session = createSession(baseConfig);
      const seed = queueStream();
      const seedTurn = session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'go'}});
      await seed.opened;
      seed.emit({
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
      });
      seed.emit({type: 'RUN_FINISHED'});
      seed.close();
      await seedTurn;
      return session;
    }

    // 10 waits take 27.75 s and an 11th is cut to the 2.25 s left: 12 attempts in 30 s.
    const exhaustingConflicts = 12;

    const lastAction = () =>
      (callMock.mock.calls[callMock.mock.calls.length - 1][0] as {action: unknown}).action;

    beforeEach(() => {
      vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout', 'Date']});
      // No jitter: retries wait exactly 250, 500, 1000, 2000, then 4000 ms each.
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
    });

    it('resends a rejected action after a backoff and shows no error once it lands', async () => {
      const session = await seedSession();
      queueConflict();
      const stream = queueStream();

      const issued = session.dispatchAction(actionMessage(2));
      await vi.advanceTimersByTimeAsync(249);
      expect(callMock).toHaveBeenCalledTimes(2);
      expect(session.request).toMatchObject({kind: 'action', name: 'selectPage'});

      await vi.advanceTimersByTimeAsync(1);
      await stream.opened;
      expect(callMock).toHaveBeenCalledTimes(3);
      expect(lastAction()).toMatchObject({name: 'selectPage', context: {page: 2}});

      stream.emit({type: 'RUN_FINISHED'});
      stream.close();

      await issued;
      expect(session.turns[0].status).toBe('complete');
      expect(session.turns[0].error).toBeUndefined();
      expect(session.actionError).toBeUndefined();
    });

    it('fails the action without failing the turn once the retries run out', async () => {
      const session = await seedSession();
      for (let attempt = 0; attempt < exhaustingConflicts; attempt++) {
        queueConflict();
      }
      const listener = vi.fn();
      session.subscribe(listener);

      const issued = session.dispatchAction(actionMessage(2));
      await vi.advanceTimersByTimeAsync(30_000);

      await issued;
      expect(callMock).toHaveBeenCalledTimes(1 + exhaustingConflicts);
      expect(session.turns[0].status).toBe('complete');
      expect(session.turns[0].error).toBeUndefined();
      expect(session.actionError).toMatchObject({message: conflictError});
      expect(listener).toHaveBeenCalled();
    });

    it('clears the action error once the next action is sent', async () => {
      const session = await seedSession();
      for (let attempt = 0; attempt < exhaustingConflicts; attempt++) {
        queueConflict();
      }
      const failed = session.dispatchAction(actionMessage(2));
      await vi.advanceTimersByTimeAsync(30_000);
      await failed;
      expect(session.actionError).toMatchObject({message: conflictError});

      const stream = queueStream();
      const issued = session.dispatchAction(actionMessage(3));
      await vi.advanceTimersByTimeAsync(0);
      expect(callMock).toHaveBeenCalledTimes(2 + exhaustingConflicts);
      expect(session.actionError).toBeUndefined();

      stream.emit({type: 'RUN_FINISHED'});
      stream.close();
      await issued;
    });

    it('does not retry a 409 that is not AGENT:ACTION_IN_FLIGHT', async () => {
      const session = await seedSession();
      callMock.mockImplementationOnce(async () => ({success: false, error: 'HTTP 409: Conflict'}));

      const issued = session.dispatchAction(actionMessage(2));
      await vi.advanceTimersByTimeAsync(30_000);

      await issued;
      expect(callMock).toHaveBeenCalledTimes(2);
      expect(session.turns[0].status).toBe('complete');
      expect(session.actionError).toMatchObject({message: 'HTTP 409: Conflict'});
    });

    it('cancels the rejected action, leaving its turn complete, when cancel() lands during the wait', async () => {
      const session = await seedSession();
      queueConflict();
      const issued = session.dispatchAction(actionMessage(2));
      await vi.advanceTimersByTimeAsync(100);

      session.cancel();

      await issued;
      await vi.advanceTimersByTimeAsync(30_000);
      expect(callMock).toHaveBeenCalledTimes(2);
      expect(session.turns[0].status).toBe('complete');
      expect(session.turns[0].error).toBeUndefined();
    });

    it('marks a rejected prompt cancelled when cancel() lands during the wait', async () => {
      const session = createSession(baseConfig);
      queueConflict();
      const turn = session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'find shoes'}});
      await vi.advanceTimersByTimeAsync(100);

      session.cancel();
      await turn;

      expect(callMock).toHaveBeenCalledTimes(1);
      expect(session.turns[0]).toMatchObject({status: 'error', error: 'Cancelled'});
    });

    it('keeps a prompt cancelled when cancel() aborts it while it is being resent', async () => {
      const session = createSession(baseConfig);
      queueConflict();
      queueAbortableCall();
      const turn = session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'find shoes'}});
      await vi.advanceTimersByTimeAsync(250);
      expect(callMock).toHaveBeenCalledTimes(2);

      session.cancel();
      await turn;

      expect(session.turns[0]).toMatchObject({status: 'error', error: 'Cancelled'});
    });

    it('resends a rejected prompt while its turn keeps streaming', async () => {
      const session = createSession(baseConfig);
      queueConflict();
      const stream = queueStream();

      const turn = session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'find shoes'}});
      await vi.advanceTimersByTimeAsync(0);
      expect(session.turns[0].status).toBe('streaming');
      expect(session.turns[0].error).toBeUndefined();

      await vi.advanceTimersByTimeAsync(250);
      await stream.opened;
      expect(callMock).toHaveBeenCalledTimes(2);
      expect(callMock.mock.calls[1][0]).toMatchObject({message: 'find shoes', action: null});

      stream.emit({type: 'RUN_FINISHED'});
      stream.close();
      await turn;
      expect(session.turns[0].status).toBe('complete');
    });

    it('fails the prompt turn once the retries run out', async () => {
      const session = createSession(baseConfig);
      for (let attempt = 0; attempt < exhaustingConflicts; attempt++) {
        queueConflict();
      }

      const turn = session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'find shoes'}});
      await vi.advanceTimersByTimeAsync(30_000);
      await turn;

      expect(callMock).toHaveBeenCalledTimes(exhaustingConflicts);
      expect(session.turns[0]).toMatchObject({status: 'error', error: conflictError});
      expect(session.actionError).toBeUndefined();
    });
  });

  describe('initialization (ADR-018)', () => {
    const shellConfig: SessionConfig = {...baseConfig, initialize: true};
    const SHELL_ID = 'ui-shell';
    const SHELL_PAGINATION_ID = 'shell-pagination';
    const SHELL_CHIPS_ID = 'shell-chips';

    const shellSurface = {
      type: 'ACTIVITY_SNAPSHOT',
      messageId: 'shell-activity',
      activityType: 'a2ui-surface',
      metadata: {turnOpeningActions: {[SHELL_ID]: ['selectAction']}},
      content: {
        messages: [
          {
            version: 'v1.0',
            createSurface: {
              surfaceId: SHELL_ID,
              catalogId: 'commerce',
              components: [
                {id: 'root', component: 'CommerceSearch'},
                {id: SHELL_PAGINATION_ID, component: 'Pagination'},
                {id: SHELL_CHIPS_ID, component: 'NextActionsBar'},
              ],
            },
          },
        ],
      },
    };

    const shellPage = {page: 1, pageSize: 24, totalEntries: 48, totalPages: 2};

    function shellPageUpdate(messageId: string) {
      return {
        type: 'ACTIVITY_SNAPSHOT',
        messageId,
        activityType: 'a2ui-surface',
        content: {
          messages: [
            {
              version: 'v1.0',
              updateDataModel: {
                surfaceId: SHELL_ID,
                path: `/state/${SHELL_PAGINATION_ID}`,
                value: shellPage,
              },
            },
          ],
        },
      };
    }

    function shellSelectPage(page: number) {
      return {
        userAction: {
          name: 'selectPage',
          surfaceId: SHELL_ID,
          sourceComponentId: SHELL_PAGINATION_ID,
          context: {page},
        },
      };
    }

    const shellChip = {
      userAction: {
        name: 'selectAction',
        surfaceId: SHELL_ID,
        sourceComponentId: SHELL_CHIPS_ID,
        context: {actionId: 'trending'},
      },
    };

    /** Creates a session whose `initialize` answers with the shell, and waits for it. */
    async function initializedSession() {
      const stream = queueStream();
      const session = createSession(shellConfig);
      await stream.opened;
      stream.emit({
        type: 'RUN_STARTED',
        conversationSessionId: 'gateway-session',
        conversationToken: 'gateway-token',
      });
      stream.emit(shellSurface);
      stream.emit({type: 'RUN_FINISHED'});
      stream.close();
      await vi.waitFor(() => expect(session.request).toBeUndefined());
      return session;
    }

    async function completePrompt(
      session: ReturnType<typeof createSession>,
      prompt: string,
      events: Record<string, unknown>[] = []
    ) {
      const stream = queueStream();
      const turn = session.dispatchAction({name: 'submitPrompt', payload: {prompt}});
      await stream.opened;
      for (const event of events) {
        stream.emit(event);
      }
      stream.emit({type: 'RUN_FINISHED'});
      stream.close();
      await turn;
    }

    it('sends initialize before any prompt, with no surface or source component', async () => {
      const stream = queueStream();
      const session = createSession(shellConfig);
      const requests: unknown[] = [];
      session.subscribe(() => requests.push(session.request));

      await stream.opened;

      expect(requests[0]).toEqual({kind: 'initialize'});
      const sent = callMock.mock.calls[0][0] as {message: unknown; action: Record<string, unknown>};
      expect(sent.message).toBeNull();
      expect(sent.action).toMatchObject({name: 'initialize', context: {}});
      expect('surfaceId' in sent.action).toBe(false);
      expect('sourceComponentId' in sent.action).toBe(false);
      expect(session.initialization).toEqual({activities: [], status: 'streaming'});

      stream.emit(shellSurface);
      stream.emit({type: 'RUN_FINISHED'});
      stream.close();
      await vi.waitFor(() => expect(session.request).toBeUndefined());

      expect(session.turns).toEqual([]);
      expect(session.initialization?.status).toBe('complete');
      expect(session.getSnapshot().initialization).toBe(session.initialization);
      expect(session.surfaces).toEqual([
        {surfaceId: SHELL_ID, rootComponentType: 'CommerceSearch', isLoading: false},
      ]);
      expect(session.a2uiMessages[0]).toEqual({
        version: 'v0.9',
        createSurface: {surfaceId: SHELL_ID, catalogId: 'commerce'},
      });
    });

    it('opens the next prompt with the session keys the initialization adopted', async () => {
      const session = await initializedSession();

      await completePrompt(session, 'find shoes');

      expect(callMock.mock.calls[1][0]).toMatchObject({
        message: 'find shoes',
        conversationSessionId: 'gateway-session',
        conversationToken: 'gateway-token',
      });
    });

    it('never sends initialize with initialize: false', async () => {
      const session = createSession(baseConfig);
      await flush();

      expect(callMock).not.toHaveBeenCalled();
      expect(session.initialization).toBeUndefined();
    });

    it('never sends initialize for a session that has a token', async () => {
      const initialized = await initializedSession();
      callMock.mockReset();

      const restored = createSession({...shellConfig, sessionToRestore: initialized.serialize()});
      await flush();

      expect(callMock).not.toHaveBeenCalled();
      expect(restored.surfaces).toEqual(initialized.surfaces);
    });

    it('never sends initialize for a restored session, even without a token', async () => {
      const initialized = await initializedSession();
      callMock.mockReset();

      const restored = createSession({
        ...shellConfig,
        sessionToRestore: {...initialized.serialize(), sessionToken: undefined},
      });
      await flush();

      expect(callMock).not.toHaveBeenCalled();
      expect(restored.surfaces).toEqual(initialized.surfaces);
    });

    it('does not send initialize after a prompt dispatched in the same task', async () => {
      const stream = queueStream();
      const session = createSession(shellConfig);
      const turn = session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'first'}});
      await stream.opened;
      stream.emit({type: 'RUN_FINISHED'});
      stream.close();
      await turn;
      await flush();

      expect(callMock).toHaveBeenCalledTimes(1);
      expect(session.initialization).toBeUndefined();
    });

    it('records a failed initialize without retrying, and the first prompt still opens the session', async () => {
      callMock.mockImplementationOnce(async () => ({success: false, error: 'Unknown action'}));
      const session = createSession(shellConfig);
      await vi.waitFor(() => expect(session.initialization?.status).toBe('error'));

      expect(session.initialization).toEqual({
        activities: [],
        status: 'error',
        error: 'Unknown action',
      });
      expect(session.request).toBeUndefined();

      await completePrompt(session, 'find shoes');

      expect(callMock).toHaveBeenCalledTimes(2);
      expect(session.turns[0].status).toBe('complete');
    });

    it('keeps the initialization cancelled when cancelled while awaiting data', async () => {
      const stream = queueStream();
      const session = createSession(shellConfig);
      await stream.opened;
      stream.emit({type: 'RUN_STARTED', conversationToken: 'gateway-token'});
      await flush();

      session.cancel();
      await vi.waitFor(() => expect(session.request).toBeUndefined());

      expect(session.initialization).toMatchObject({status: 'error', error: 'Cancelled'});
    });

    it('marks the initialization cancelled when cancelled in flight', async () => {
      const stream = queueStream();
      const session = createSession(shellConfig);
      await stream.opened;

      session.cancel();
      stream.close();
      await vi.waitFor(() => expect(session.request).toBeUndefined());

      expect(session.initialization).toEqual({activities: [], status: 'error', error: 'Cancelled'});
      expect(session.turns).toEqual([]);
      expect(callMock).toHaveBeenCalledTimes(1);
    });

    it('records an action dispatched before the first turn with the initialization', async () => {
      const session = await initializedSession();

      const actionStream = queueStream();
      const action = session.dispatchAction(shellSelectPage(1));
      await actionStream.opened;

      expect(session.request).toEqual({
        kind: 'action',
        component: 'Pagination',
        name: 'selectPage',
        surfaceId: SHELL_ID,
        sourceComponentId: SHELL_PAGINATION_ID,
      });

      actionStream.emit({type: 'RUN_STARTED'});
      actionStream.emit(shellPageUpdate('shell-page'));
      actionStream.emit({type: 'RUN_FINISHED'});
      actionStream.close();
      await action;

      expect(session.turns).toEqual([]);
      expect(session.initialization?.activities.map((activity) => activity.id)).toEqual([
        'shell-activity',
        'shell-page',
      ]);
      expect(session.initialization?.status).toBe('complete');
      expect(session.state[SHELL_ID]).toEqual({state: {[SHELL_PAGINATION_ID]: shellPage}});
    });

    it('leaves the initialization as it is and sets actionError when an action before the first turn fails', async () => {
      const session = await initializedSession();
      const actionStream = queueStream();
      const action = session.dispatchAction(shellSelectPage(1));
      await actionStream.opened;
      actionStream.emit({type: 'RUN_ERROR', message: 'Suggestions unavailable'});
      actionStream.close();
      await action;

      expect(session.initialization?.status).toBe('complete');
      expect(session.actionError).toEqual({
        message: 'Suggestions unavailable',
        component: 'Pagination',
        name: 'selectPage',
        surfaceId: SHELL_ID,
        sourceComponentId: SHELL_PAGINATION_ID,
      });
    });

    it('sends an action on a surface the initialization created, several turns later', async () => {
      const session = await initializedSession();
      await completePrompt(session, 'first', [PAGINATION_SURFACE]);
      await completePrompt(session, 'second');

      const actionStream = queueStream();
      const action = session.dispatchAction(shellSelectPage(1));
      await actionStream.opened;

      expect(session.request).toEqual({
        kind: 'action',
        component: 'Pagination',
        name: 'selectPage',
        surfaceId: SHELL_ID,
        sourceComponentId: SHELL_PAGINATION_ID,
        turnId: session.turns[1].id,
      });
      expect(callMock.mock.calls[3][0]).toMatchObject({
        message: null,
        action: {
          name: 'selectPage',
          surfaceId: SHELL_ID,
          sourceComponentId: SHELL_PAGINATION_ID,
          context: {page: 1},
        },
      });

      actionStream.emit(shellPageUpdate('shell-page'));
      actionStream.emit({type: 'RUN_FINISHED'});
      actionStream.close();
      await action;

      expect(session.state[SHELL_ID]).toEqual({state: {[SHELL_PAGINATION_ID]: shellPage}});
      expect(session.turns[1].response.activities.map((activity) => activity.id)).toEqual([
        'shell-page',
      ]);
      expect(session.turns.map((turn) => turn.status)).toEqual(['complete', 'complete']);
    });

    it('validates and applies a later turn update to a surface the initialization created', async () => {
      const session = await initializedSession();
      await completePrompt(session, 'first');

      await completePrompt(session, 'second', [shellPageUpdate('shell-page')]);

      expect(session.state[SHELL_ID]).toEqual({state: {[SHELL_PAGINATION_ID]: shellPage}});
      expect(session.surfaces.map((surface) => surface.surfaceId)).toEqual([SHELL_ID]);
      expect(session.turns.map((turn) => turn.response.surfaces)).toEqual([[], []]);
    });

    it('leaves the active turn as it is and sets actionError when an action on the shell fails', async () => {
      const session = await initializedSession();
      await completePrompt(session, 'first');

      callMock.mockImplementationOnce(async () => ({success: false, error: 'Bad gateway'}));
      await session.dispatchAction(shellSelectPage(1));

      expect(session.turns.map((turn) => turn.status)).toEqual(['complete']);
      expect(session.actionError).toEqual({
        message: 'Bad gateway',
        component: 'Pagination',
        name: 'selectPage',
        surfaceId: SHELL_ID,
        sourceComponentId: SHELL_PAGINATION_ID,
      });
    });

    it('opens the first turn for an action the shell announces as turn-opening', async () => {
      const session = await initializedSession();

      const stream = queueStream();
      const sent = session.dispatchAction(shellChip);
      await stream.opened;

      expect(session.turns).toHaveLength(1);
      expect(session.turns[0].input.action).toMatchObject({
        component: 'NextActionsBar',
        surfaceId: SHELL_ID,
      });
      expect(session.request).toMatchObject({kind: 'action', turnId: session.turns[0].id});
      stream.emit({type: 'RUN_FINISHED'});
      stream.close();
      await sent;

      expect(session.turns[0].status).toBe('complete');
      expect(session.initialization?.activities).toHaveLength(1);
    });

    it('opens a new turn for an action the shell announces as turn-opening, several turns later', async () => {
      const session = await initializedSession();
      await completePrompt(session, 'first');
      await completePrompt(session, 'second');

      const stream = queueStream();
      const sent = session.dispatchAction(shellChip);
      await stream.opened;
      stream.emit({type: 'RUN_FINISHED'});
      stream.close();
      await sent;

      expect(session.turns.map((turn) => turn.input.prompt ?? turn.input.action?.name)).toEqual([
        'first',
        'second',
        'selectAction',
      ]);
    });

    it('round-trips the initialization, the turns and the session state through serialized format 4', async () => {
      const session = await initializedSession();
      await completePrompt(session, 'first', [shellPageUpdate('shell-page')]);

      const serialized = session.serialize();
      const restored = createSession({...shellConfig, sessionToRestore: serialized});

      expect(serialized.version).toBe(4);
      expect(serialized.initialization).toEqual({
        activities: session.initialization?.activities,
        status: 'complete',
      });
      expect(restored.initialization).toEqual(session.initialization);
      expect(restored.turns).toEqual(session.turns);
      expect(restored.surfaces).toEqual(session.surfaces);
      expect(restored.state).toEqual(session.state);
      expect(restored.a2uiMessages).toEqual(session.a2uiMessages);
    });

    it('restores an initialization persisted mid-stream as interrupted', async () => {
      const stream = queueStream();
      const session = createSession(shellConfig);
      await stream.opened;
      stream.emit({type: 'RUN_STARTED', conversationToken: 'gateway-token'});
      stream.emit(shellSurface);
      await vi.waitFor(() => expect(session.initialization?.activities).toHaveLength(1));

      const restored = createSession({...shellConfig, sessionToRestore: session.serialize()});

      expect(restored.initialization).toMatchObject({
        status: 'error',
        error: 'Stream was interrupted',
      });
      expect(restored.a2uiMessages).toEqual(session.a2uiMessages);
      session.cancel();
      stream.close();
    });
  });
});
