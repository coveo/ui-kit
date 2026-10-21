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
import {createSession, type Session, type SessionConfig} from './create-session.js';

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

const QuerySuggestionsSchema = z.strictObject({
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
      selectSuggestion: z.strictObject({payload: z.strictObject({expression: z.string()})}),
    })
    .optional(),
});

const contracts = z.discriminatedUnion('component', [
  PaginationSchema,
  NextActionsBarSchema,
  QuerySuggestionsSchema,
]) as unknown as ContractsSchema;

const SearchBoxSurfaceTemplate = {
  template: 'search-box',
  catalogId: 'catalog',
  components: [{id: 'root', component: 'QuerySuggestions'}],
  dataModel: {'/state/root': {query: '', completions: []}},
} as const;

const contract = {
  components: contracts,
  surfaceTemplates: [SearchBoxSurfaceTemplate],
  lookupActions: {QuerySuggestions: ['fetchSuggestions']},
} as const;

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

const baseConfig: SessionConfig<typeof contract> = {
  contract,
  organizationId: 'org-1',
  accessToken: 'token-1',
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

    it('preempts a streaming prompt turn (a prompt is a prioritizing intention)', async () => {
      const session = createSession(baseConfig);

      const first = queueStream();
      void session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'first'}});
      await first.opened;
      expect(session.turns[0].status).toBe('streaming');

      const second = queueStream();
      void session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'second'}});
      await second.opened;

      expect(callMock).toHaveBeenCalledTimes(2);
      expect(session.turns.map((turn) => [turn.input.prompt, turn.status])).toEqual([
        ['first', 'error'],
        ['second', 'streaming'],
      ]);
      expect(session.turns[0].error).toBe('Cancelled');

      second.emit({type: 'RUN_FINISHED'});
      second.close();
      await flush();
      expect(session.turns[1].status).toBe('complete');

      // Already aborted; closing again is a no-op in the harness.
      first.close();
      await flush();
    });
  });

  describe('dispatchAction guard while streaming', () => {
    it('ignores dispatchAction while a turn is streaming and leaves turns unchanged', async () => {
      const session = createSession(baseConfig);

      const first = queueStream();
      const submitPromise = session.dispatchAction({
        name: 'submitPrompt',
        payload: {prompt: 'first'},
      });
      await first.opened;

      // Seed the active (still-streaming) turn with a commerce-search surface
      // carrying a Pagination node so `dispatchAction` can recover the component
      // discriminant and reach the private execute path — where the streaming
      // guard must then withhold the POST.
      first.emit({
        type: 'ACTIVITY_SNAPSHOT',
        activityType: 'a2ui-surface',
        messageId: 'surface-1',
        content: {
          messages: [
            {
              version: 'v1.0',
              createSurface: {
                surfaceId: 'ui-1',
                rootId: 'root',
                components: [
                  {id: 'root', component: 'CommerceSearch'},
                  {id: 'pagination-1', component: 'Pagination'},
                ],
              },
            },
          ],
        },
      });
      await flush();

      const turnsBefore = session.turns;
      expect(turnsBefore).toHaveLength(1);
      expect(turnsBefore[0].status).toBe('streaming');

      await session.dispatchAction({
        userAction: {
          name: 'selectPage',
          surfaceId: 'ui-1',
          sourceComponentId: 'pagination-1',
          context: {page: 2},
        },
      });

      // Only the original prompt reached the endpoint; the streaming guard
      // withheld the action dispatch and left the turn list unchanged.
      expect(callMock).toHaveBeenCalledTimes(1);
      expect(session.turns).toHaveLength(1);
      expect(session.turns[0]).toBe(turnsBefore[0]);

      first.emit({type: 'RUN_FINISHED'});
      first.close();
      await submitPromise;
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

    it('fails the active turn when building an action request throws, sending nothing', async () => {
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
      expect(session.turns[0].status).toBe('error');
      expect(session.turns[0].error).toBe('boom');
    });
  });

  describe('prompt preempts an in-flight gesture (③)', () => {
    // A gesture reuses a complete turn, so only `isStreaming()` sees it in flight.
    it('preempts the in-flight gesture (cancelled) and opens the prompt immediately', async () => {
      const session = createSession(baseConfig);

      // A Pagination surface so `selectPage` resolves a discriminant.
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
      expect(session.turns[0].status).toBe('complete');
      expect(callMock).toHaveBeenCalledTimes(1);

      const actionMessage = (page: number) => ({
        userAction: {
          name: 'selectPage',
          surfaceId: 'commerce-search-surface',
          sourceComponentId: 'pagination-1',
          context: {page},
        },
      });

      const actionAStream = queueStream();
      const issuedA = session.actions.issue(actionMessage(2));
      const outcomeA: string[] = [];
      issuedA.onSettled((o) => outcomeA.push(o));
      await actionAStream.opened;
      expect(callMock).toHaveBeenCalledTimes(2);
      expect(session.turns.some((turn) => turn.status === 'streaming')).toBe(false);
      expect(outcomeA).toEqual([]);

      const promptStream = queueStream();
      void session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'next question'}});
      await promptStream.opened;

      expect(outcomeA).toEqual(['cancelled']);
      expect(callMock).toHaveBeenCalledTimes(3);
      const streamingTurn = session.turns.find((turn) => turn.status === 'streaming');
      expect(streamingTurn?.input.prompt).toBe('next question');

      // Already aborted; closing again is a no-op in the harness.
      actionAStream.close();
      await flush();
      await flush();

      expect(callMock).toHaveBeenCalledTimes(3);
      expect(outcomeA).toEqual(['cancelled']);
      const lastRequest = callMock.mock.calls[callMock.mock.calls.length - 1][0] as {
        message: string | null;
        action: unknown;
      };
      expect(lastRequest).toMatchObject({message: 'next question', action: null});

      promptStream.emit({type: 'RUN_FINISHED'});
      promptStream.close();
      await flush();
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

      const issued = session.actions.issue(actionMessage(2));
      await vi.advanceTimersByTimeAsync(249);
      expect(callMock).toHaveBeenCalledTimes(2);
      expect(session.actions.getSnapshot().inFlight).toBe(issued.id);

      await vi.advanceTimersByTimeAsync(1);
      await stream.opened;
      expect(callMock).toHaveBeenCalledTimes(3);
      expect(lastAction()).toMatchObject({name: 'selectPage', context: {page: 2}});

      stream.emit({type: 'RUN_FINISHED'});
      stream.close();

      expect(await issued.settled).toBe('answered');
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

      const issued = session.actions.issue(actionMessage(2));
      await vi.advanceTimersByTimeAsync(30_000);

      expect(await issued.settled).toBe('failed');
      expect(callMock).toHaveBeenCalledTimes(1 + exhaustingConflicts);
      expect(session.turns[0].status).toBe('complete');
      expect(session.turns[0].error).toBeUndefined();
      expect(session.actionError).toBe(conflictError);
      expect(listener).toHaveBeenCalled();
    });

    it('keeps queued actions behind the rejected one, in order', async () => {
      const session = await seedSession();
      queueConflict();
      const streamA = queueStream();
      const streamB = queueStream();

      const issuedA = session.actions.issue(actionMessage(2));
      const issuedB = session.actions.issue(actionMessage(3));
      await vi.advanceTimersByTimeAsync(250);
      await streamA.opened;
      expect(callMock).toHaveBeenCalledTimes(3);
      expect(lastAction()).toMatchObject({context: {page: 2}});

      streamA.emit({type: 'RUN_FINISHED'});
      streamA.close();
      expect(await issuedA.settled).toBe('answered');
      await streamB.opened;
      expect(callMock).toHaveBeenCalledTimes(4);
      expect(lastAction()).toMatchObject({context: {page: 3}});

      streamB.emit({type: 'RUN_FINISHED'});
      streamB.close();
      expect(await issuedB.settled).toBe('answered');
    });

    it('clears the action error once the next action is sent', async () => {
      const session = await seedSession();
      for (let attempt = 0; attempt < exhaustingConflicts; attempt++) {
        queueConflict();
      }
      const failed = session.actions.issue(actionMessage(2));
      await vi.advanceTimersByTimeAsync(30_000);
      expect(await failed.settled).toBe('failed');
      expect(session.actionError).toBe(conflictError);

      const stream = queueStream();
      const issued = session.actions.issue(actionMessage(3));
      await vi.advanceTimersByTimeAsync(0);
      expect(callMock).toHaveBeenCalledTimes(2 + exhaustingConflicts);
      expect(session.actionError).toBeUndefined();

      stream.emit({type: 'RUN_FINISHED'});
      stream.close();
      expect(await issued.settled).toBe('answered');
    });

    it('does not retry a 409 that is not AGENT:ACTION_IN_FLIGHT', async () => {
      const session = await seedSession();
      callMock.mockImplementationOnce(async () => ({success: false, error: 'HTTP 409: Conflict'}));

      const issued = session.actions.issue(actionMessage(2));
      await vi.advanceTimersByTimeAsync(30_000);

      await issued.settled;
      expect(callMock).toHaveBeenCalledTimes(2);
      expect(session.turns[0]).toMatchObject({status: 'error', error: 'HTTP 409: Conflict'});
    });

    it('stops waiting when a prompt preempts the rejected action', async () => {
      const session = await seedSession();
      queueConflict();
      const issued = session.actions.issue(actionMessage(2));
      await vi.advanceTimersByTimeAsync(0);
      expect(callMock).toHaveBeenCalledTimes(2);

      const promptStream = queueStream();
      void session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'next question'}});
      await promptStream.opened;
      expect(await issued.settled).toBe('cancelled');

      await vi.advanceTimersByTimeAsync(30_000);
      expect(callMock).toHaveBeenCalledTimes(3);
      expect(session.turns[0]).toMatchObject({status: 'complete'});
      expect(session.turns[0].error).toBeUndefined();

      promptStream.emit({type: 'RUN_FINISHED'});
      promptStream.close();
    });

    it('cancels the rejected action, leaving its turn complete, when cancel() lands during the wait', async () => {
      const session = await seedSession();
      queueConflict();
      const issued = session.actions.issue(actionMessage(2));
      await vi.advanceTimersByTimeAsync(100);

      session.cancel();

      expect(await issued.settled).toBe('cancelled');
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

    it('leaves the turn complete when a prompt aborts an action while it is being resent', async () => {
      const session = await seedSession();
      queueConflict();
      queueAbortableCall();
      const issued = session.actions.issue(actionMessage(2));
      await vi.advanceTimersByTimeAsync(250);
      expect(callMock).toHaveBeenCalledTimes(3);

      const promptStream = queueStream();
      void session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'next question'}});
      await promptStream.opened;
      await vi.advanceTimersByTimeAsync(0);

      expect(await issued.settled).toBe('cancelled');
      expect(session.turns[0]).toMatchObject({status: 'complete'});
      expect(session.turns[0].error).toBeUndefined();

      promptStream.emit({type: 'RUN_FINISHED'});
      promptStream.close();
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

  describe('surface instances and lookups', () => {
    const fetchSuggestions = (surfaceId: string, query: string) => ({
      userAction: {
        name: 'fetchSuggestions',
        surfaceId,
        sourceComponentId: 'root',
        context: {query},
      },
    });

    const suggestionsSnapshot = (surfaceId: string, query: string) => ({
      type: 'ACTIVITY_SNAPSHOT',
      messageId: 'lookup-suggestions',
      activityType: 'a2ui-surface',
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
    });

    /** Answers a lookup's stream with its suggestions, and ends it like a lookup run. */
    function answer(stream: ControllableStream, surfaceId: string, query: string): void {
      stream.emit({
        type: 'RUN_STARTED',
        conversationSessionId: 'lookup-session',
        conversationToken: 'lookup-token',
      });
      stream.emit(suggestionsSnapshot(surfaceId, query));
      stream.emit({type: 'RUN_FINISHED'});
      stream.close();
    }

    const requestAt = (index: number) =>
      callMock.mock.calls[index][0] as {
        surfaceTemplate?: string;
        conversationToken?: string;
        message: string | null;
        action: Record<string, unknown> | null;
      };

    /** Completes a first turn carrying a Pagination surface, so `selectPage` can be issued. */
    async function seedSession() {
      const session = createSession(baseConfig);
      const seed = queueStream();
      const seedTurn = session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'go'}});
      await seed.opened;
      seed.emit({type: 'RUN_STARTED', conversationToken: 'session-token'});
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

    let warn: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    describe('creating instances', () => {
      it("holds the instance's creation under the given surface id before any request", () => {
        const session = createSession(baseConfig);

        const searchBox = session.instantiateSurface('search-box', {surfaceId: 'header'});

        expect(searchBox).toMatchObject({surfaceId: 'header', template: 'search-box'});
        expect(searchBox.messages).toEqual([
          {version: 'v0.9', createSurface: {surfaceId: 'header', catalogId: 'catalog'}},
          {
            version: 'v0.9',
            updateComponents: {
              surfaceId: 'header',
              components: [{id: 'root', component: 'QuerySuggestions'}],
            },
          },
          {
            version: 'v0.9',
            updateDataModel: {
              surfaceId: 'header',
              path: '/state/root',
              value: {query: '', completions: []},
            },
          },
        ]);
        expect(callMock).not.toHaveBeenCalled();
        expect(session.turns).toEqual([]);
      });

      it('mints a surface id that no live instance holds', () => {
        const session = createSession(baseConfig);
        session.instantiateSurface('search-box', {surfaceId: 'search-box-1'});

        const first = session.instantiateSurface('search-box');
        const second = session.instantiateSurface('search-box');

        expect(new Set([first.surfaceId, second.surfaceId, 'search-box-1']).size).toBe(3);
      });

      it('refuses a template the contract does not declare', () => {
        const session: Session = createSession(baseConfig);

        expect(() => session.instantiateSurface('cart-badge')).toThrow(/cart-badge/);
      });

      it('refuses a surface id a live instance holds, and frees it once disposed of', () => {
        const session = createSession(baseConfig);
        const searchBox = session.instantiateSurface('search-box', {surfaceId: 'header'});

        expect(() => session.instantiateSurface('search-box', {surfaceId: 'header'})).toThrow(
          /header/
        );

        searchBox.dispose();
        searchBox.dispose();

        expect(session.instantiateSurface('search-box', {surfaceId: 'header'}).surfaceId).toBe(
          'header'
        );
      });

      it('leaves instances out of the serialized session', () => {
        const session = createSession(baseConfig);
        const serialized = JSON.stringify(session.serialize());

        session.instantiateSurface('search-box', {surfaceId: 'header'});

        expect(JSON.stringify(session.serialize())).toBe(serialized);
      });
    });

    describe('sending lookups', () => {
      it('sends a lookup before any prompt, without a token, and applies its result without opening a session', async () => {
        const session = createSession(baseConfig);
        const searchBox = session.instantiateSurface('search-box', {surfaceId: 'header'});
        const listener = vi.fn();
        session.subscribe(listener);
        const stream = queueStream();

        const lookup = session.dispatchAction(fetchSuggestions('header', 'red'));
        await stream.opened;
        answer(stream, 'header', 'red');
        await lookup;

        expect(requestAt(0)).toMatchObject({
          surfaceTemplate: 'search-box',
          message: null,
          action: {
            surfaceId: 'header',
            sourceComponentId: 'root',
            name: 'fetchSuggestions',
            context: {query: 'red'},
          },
        });
        expect(requestAt(0).conversationToken).toBeUndefined();
        expect(searchBox.messages.at(-1)).toEqual({
          version: 'v0.9',
          updateDataModel: {
            surfaceId: 'header',
            path: '/state/root',
            value: {query: 'red', completions: [{expression: 'red shoes'}]},
          },
        });
        expect(listener).toHaveBeenCalled();
        expect(session.turns).toEqual([]);

        const promptStream = queueStream();
        void session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'red shoes'}});
        await promptStream.opened;

        expect(requestAt(1).conversationToken).toBeUndefined();
        expect(requestAt(1).surfaceTemplate).toBeUndefined();
        promptStream.emit({type: 'RUN_FINISHED'});
        promptStream.close();
      });

      it("sends the session's token with a lookup once there is one", async () => {
        const session = await seedSession();
        session.instantiateSurface('search-box', {surfaceId: 'header'});
        const stream = queueStream();

        const lookup = session.dispatchAction(fetchSuggestions('header', 'red'));
        await stream.opened;
        answer(stream, 'header', 'red');
        await lookup;

        expect(requestAt(1)).toMatchObject({
          surfaceTemplate: 'search-box',
          conversationToken: 'session-token',
        });
      });

      it('applies each result only to its own instance, and never lets one instance abort the other', async () => {
        const session = createSession(baseConfig);
        const header = session.instantiateSurface('search-box', {surfaceId: 'header'});
        const drawer = session.instantiateSurface('search-box', {surfaceId: 'drawer'});
        const headerStream = queueStream();
        const drawerStream = queueStream();

        const headerLookup = session.dispatchAction(fetchSuggestions('header', 'red'));
        await headerStream.opened;
        const drawerLookup = session.dispatchAction(fetchSuggestions('drawer', 'blue'));
        await drawerStream.opened;
        answer(headerStream, 'header', 'red');
        answer(drawerStream, 'drawer', 'blue');
        await Promise.all([headerLookup, drawerLookup]);

        const lastValue = (messages: readonly Record<string, unknown>[]) =>
          (messages.at(-1)?.['updateDataModel'] as {value: unknown}).value;
        expect(lastValue(header.messages)).toMatchObject({query: 'red'});
        expect(lastValue(drawer.messages)).toMatchObject({query: 'blue'});
        expect(header.messages).toHaveLength(4);
        expect(drawer.messages).toHaveLength(4);
      });

      it('aborts the previous lookup of the same component and action, and never applies its response', async () => {
        const session = createSession(baseConfig);
        const searchBox = session.instantiateSurface('search-box', {surfaceId: 'header'});
        const stale = queueStream();
        const fresh = queueStream();

        const staleLookup = session.dispatchAction(fetchSuggestions('header', 'r'));
        await stale.opened;
        const freshLookup = session.dispatchAction(fetchSuggestions('header', 're'));
        await fresh.opened;
        answer(fresh, 'header', 're');
        await Promise.all([staleLookup, freshLookup]);

        expect(callMock.mock.calls[0][2]?.signal?.aborted).toBe(true);
        expect(searchBox.messages).toHaveLength(4);
        expect(searchBox.messages.at(-1)).toMatchObject({
          updateDataModel: {value: {query: 're'}},
        });
        expect(warn).not.toHaveBeenCalled();
      });

      it("aborts a disposed instance's lookup and drops its late response, even under a reused surface id", async () => {
        const session = createSession(baseConfig);
        const disposed = session.instantiateSurface('search-box', {surfaceId: 'header'});
        const stream = queueStream();
        const lookup = session.dispatchAction(fetchSuggestions('header', 'red'));
        await stream.opened;

        disposed.dispose();
        await lookup;

        expect(callMock.mock.calls[0][2]?.signal?.aborted).toBe(true);
        expect(session.instantiateSurface('search-box', {surfaceId: 'header'}).messages).toEqual(
          disposed.messages
        );
      });

      it('drops the rest of a response already read once its instance is disposed of and created again', async () => {
        const session = createSession(baseConfig);
        let searchBox = session.instantiateSurface('search-box', {surfaceId: 'header'});
        const recreateOnFirstResult = session.subscribe(() => {
          recreateOnFirstResult();
          searchBox.dispose();
          searchBox = session.instantiateSurface('search-box', {surfaceId: 'header'});
        });
        const frames = [
          suggestionsSnapshot('header', 'r'),
          suggestionsSnapshot('header', 're'),
          {type: 'RUN_FINISHED'},
        ];
        callMock.mockImplementationOnce(async () => ({
          success: true,
          data: {
            stream: new ReadableStream<Uint8Array>({
              start(controller) {
                controller.enqueue(
                  encoder.encode(
                    frames.map((frame) => `data: ${JSON.stringify(frame)}\n\n`).join('')
                  )
                );
                controller.close();
              },
            }),
          },
        }));

        await session.dispatchAction(fetchSuggestions('header', 're'));

        expect(searchBox.messages).toHaveLength(3);
      });

      it('sends a lookup at once while a prompt streams, and leaves the prompt be', async () => {
        const session = createSession(baseConfig);
        const searchBox = session.instantiateSurface('search-box', {surfaceId: 'header'});
        const promptStream = queueStream();
        const prompt = session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'shoes'}});
        await promptStream.opened;
        const lookupStream = queueStream();

        const lookup = session.dispatchAction(fetchSuggestions('header', 'red'));
        await lookupStream.opened;
        answer(lookupStream, 'header', 'red');
        await lookup;

        expect(callMock).toHaveBeenCalledTimes(2);
        expect(callMock.mock.calls[0][2]?.signal?.aborted).toBe(false);
        expect(session.turns).toHaveLength(1);
        expect(session.turns[0].status).toBe('streaming');
        expect(session.serialize().sessionToken).toBeUndefined();
        expect(searchBox.messages).toHaveLength(4);

        promptStream.emit({type: 'RUN_FINISHED'});
        promptStream.close();
        await prompt;
        expect(session.turns[0].status).toBe('complete');
      });

      it('sends a lookup at once while a gesture is in flight, and leaves the gesture be', async () => {
        const session = await seedSession();
        session.instantiateSurface('search-box', {surfaceId: 'header'});
        const gestureStream = queueStream();
        const gesture = session.actions.issue({
          userAction: {
            name: 'selectPage',
            surfaceId: 'commerce-search-surface',
            sourceComponentId: 'pagination-1',
            context: {page: 2},
          },
        });
        await gestureStream.opened;
        const lookupStream = queueStream();

        const lookup = session.dispatchAction(fetchSuggestions('header', 'red'));
        await lookupStream.opened;
        answer(lookupStream, 'header', 'red');
        await lookup;

        expect(callMock).toHaveBeenCalledTimes(3);
        expect(session.actions.getSnapshot().inFlight).toBe(gesture.id);

        gestureStream.emit({type: 'RUN_FINISHED'});
        gestureStream.close();
        expect(await gesture.settled).toBe('answered');
        expect(session.turns[0]).toMatchObject({status: 'complete'});
        expect(session.serialize().sessionToken).toBe('session-token');
      });

      it('leaves turns and the action error untouched when a lookup fails', async () => {
        const session = await seedSession();
        session.instantiateSurface('search-box', {surfaceId: 'header'});
        callMock.mockImplementationOnce(async () => ({success: false, error: 'HTTP 500'}));

        await session.dispatchAction(fetchSuggestions('header', 'red'));

        expect(session.turns[0]).toMatchObject({status: 'complete'});
        expect(session.turns[0].error).toBeUndefined();
        expect(session.actionError).toBeUndefined();
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('HTTP 500'));
      });

      it('leaves lookups running when the session is cancelled', async () => {
        const session = createSession(baseConfig);
        const searchBox = session.instantiateSurface('search-box', {surfaceId: 'header'});
        const promptStream = queueStream();
        void session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'shoes'}});
        await promptStream.opened;
        const lookupStream = queueStream();
        const lookup = session.dispatchAction(fetchSuggestions('header', 'red'));
        await lookupStream.opened;

        session.cancel();
        answer(lookupStream, 'header', 'red');
        await lookup;

        expect(callMock.mock.calls[1][2]?.signal?.aborted).toBe(false);
        expect(searchBox.messages).toHaveLength(4);
      });
    });

    describe('refusing actions', () => {
      it('drops an action the contract does not mark as a lookup', async () => {
        const session = createSession(baseConfig);
        session.instantiateSurface('search-box', {surfaceId: 'header'});

        await session.dispatchAction({
          userAction: {
            name: 'selectSuggestion',
            surfaceId: 'header',
            sourceComponentId: 'root',
            context: {expression: 'red shoes'},
          },
        });

        expect(callMock).not.toHaveBeenCalled();
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('not a lookup'));
      });

      it('drops a lookup with an invalid payload', async () => {
        const session = createSession(baseConfig);
        session.instantiateSurface('search-box', {surfaceId: 'header'});

        await session.dispatchAction({
          userAction: {
            name: 'fetchSuggestions',
            surfaceId: 'header',
            sourceComponentId: 'root',
            context: {query: 42},
          },
        });

        expect(callMock).not.toHaveBeenCalled();
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('Invalid payload'));
      });

      it('drops an action from a node the instance does not have', async () => {
        const session = createSession(baseConfig);
        session.instantiateSurface('search-box', {surfaceId: 'header'});

        await session.dispatchAction({
          userAction: {name: 'fetchSuggestions', surfaceId: 'header', sourceComponentId: 'nope'},
        });

        expect(callMock).not.toHaveBeenCalled();
      });

      it('sends nothing for an action from a disposed instance', async () => {
        const session = createSession(baseConfig);
        session.instantiateSurface('search-box', {surfaceId: 'header'}).dispose();

        await session.dispatchAction(fetchSuggestions('header', 'red'));

        expect(callMock).not.toHaveBeenCalled();
      });

      it('drops an inbound update that breaks the component contract, or targets another surface', async () => {
        const session = createSession(baseConfig);
        const searchBox = session.instantiateSurface('search-box', {surfaceId: 'header'});
        const stream = queueStream();

        const lookup = session.dispatchAction(fetchSuggestions('header', 'red'));
        await stream.opened;
        stream.emit({
          type: 'ACTIVITY_SNAPSHOT',
          messageId: 'lookup-suggestions',
          activityType: 'a2ui-surface',
          content: {
            messages: [
              {
                version: 'v1.0',
                updateDataModel: {surfaceId: 'header', path: '/state/root', value: {query: 1}},
              },
              {
                version: 'v1.0',
                updateDataModel: {
                  surfaceId: 'drawer',
                  path: '/state/root',
                  value: {query: 'red', completions: []},
                },
              },
            ],
          },
        });
        stream.emit({type: 'RUN_FINISHED'});
        stream.close();
        await lookup;

        expect(searchBox.messages).toHaveLength(3);
      });
    });
  });
});
