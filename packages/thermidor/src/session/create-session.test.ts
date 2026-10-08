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

const baseConfig: SessionConfig = {
  contracts,
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

      // A second prompt arrives while the first is still streaming. Under ③ a prompt is a new
      // intention that preempts: `isStreaming()` is true → the first turn's stream is aborted
      // (its turn goes 'error'/Cancelled) and a new turn opens for the second prompt.
      const second = queueStream();
      void session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'second'}});
      await second.opened;

      expect(callMock).toHaveBeenCalledTimes(2);
      // Two turns now exist: the preempted first (cancelled) and the streaming second.
      expect(session.turns.map((turn) => [turn.input.prompt, turn.status])).toEqual([
        ['first', 'error'],
        ['second', 'streaming'],
      ]);
      expect(session.turns[0].error).toBe('Cancelled');

      second.emit({type: 'RUN_FINISHED'});
      second.close();
      await flush();
      expect(session.turns[1].status).toBe('complete');

      // The first stream was aborted by the preemption; its controller is already closed. Closing
      // again is a guarded no-op in the harness.
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
    /**
     * The final behaviour (③): a prompt is a new intention that supersedes any gesture, so it
     * PREEMPTS instead of waiting. When a prompt arrives while a gesture stream is physically in
     * flight, `startPromptTurn`:
     *   1. withholds the gestures still queued (`withholdQueued`);
     *   2. aborts the in-flight gesture's stream (`cancel`) so its late response never touches the
     *      surface, and settles its dispatch `'cancelled'` (`cancelInFlight`) so the overlay it
     *      put on screen is released;
     *   3. opens the prompt turn immediately.
     *
     * This is reachable because the serialization is guarded on `isStreaming()` (the abort
     * controller — a stream physically in flight), NOT on `hasStreamingTurn()` (a streaming TURN).
     * A gesture reuses an already-`complete` turn and never reopens a streaming turn, so it is
     * invisible to the turn status; the abort controller is the signal both the prompt path and
     * the gesture path share.
     *
     * Scenario, deterministic through the public surface:
     *   1. a completed turn carries a Pagination surface, session idle;
     *   2. gesture A is issued while idle → drains, its send held in flight (A reuses the COMPLETE
     *      turn, so no turn is streaming, but `isStreaming()` is true);
     *   3. a prompt is submitted while A is in flight → `isStreaming()` true → A is preempted
     *      (settled `'cancelled'`), the prompt turn opens and streams;
     *   4. A's (now superseded) stream closes → it must NOT touch the surface and sends nothing new.
     */
    it('preempts the in-flight gesture (cancelled) and opens the prompt immediately', async () => {
      const session = createSession(baseConfig);

      // (1) A completed turn carrying a Pagination surface so `selectPage` resolves a discriminant.
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

      // (2) Gesture A: issued while idle → drains, send held in flight. A reuses the COMPLETE turn,
      // so no turn is streaming, but a stream is physically in flight (isStreaming() is true).
      const actionAStream = queueStream();
      const issuedA = session.actions.issue(actionMessage(2));
      const outcomeA: string[] = [];
      issuedA.onSettled((o) => outcomeA.push(o));
      await actionAStream.opened;
      expect(callMock).toHaveBeenCalledTimes(2);
      expect(session.turns.some((turn) => turn.status === 'streaming')).toBe(false);
      expect(outcomeA).toEqual([]);

      // (3) A prompt is submitted while A is in flight. isStreaming() is true → A is preempted:
      // its dispatch settles 'cancelled' synchronously, its stream is aborted, and the prompt turn
      // opens and streams.
      const promptStream = queueStream();
      void session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'next question'}});
      await promptStream.opened;

      // The deliverable of ③: A is cancelled the instant the prompt arrives (not left waiting, not
      // 'answered'), and the prompt turn is streaming.
      expect(outcomeA).toEqual(['cancelled']);
      expect(callMock).toHaveBeenCalledTimes(3);
      const streamingTurn = session.turns.find((turn) => turn.status === 'streaming');
      expect(streamingTurn?.input.prompt).toBe('next question');

      // (4) A's stream was aborted by the preemption (`cancel`), so its controller is already
      // closed. Closing again is a no-op (guarded in the harness). A's late close must send nothing
      // new and must not re-settle A — the prompt owns the surface.
      actionAStream.close();
      await flush();
      await flush();

      // Still exactly three calls (seed prompt, gesture A, prompt). A's abort sent nothing and did
      // not re-settle A.
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
});
