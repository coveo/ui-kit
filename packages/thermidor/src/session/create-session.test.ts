import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {z} from 'zod/v4';

/**
 * Unit tests for the session lifecycle.
 *
 * Covers the lifecycle guards and re-entry rules:
 *
 *   - cancel() during an in-flight stream stops consuming, retains the
 *     partial response already folded, and sets the active turn to `error`.
 *   - cancel() with nothing in flight is a no-op; turns unchanged.
 *   - while a turn is streaming, submit() is ignored; turns unchanged.
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

import {createSession, type SessionConfig} from './create-session.js';

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

/**
 * A minimal contracts schema for the lifecycle tests: a Zod v4 discriminated
 * union of `z.strictObject` component contracts (matching the
 * `z.core.$strict` object config the `ContractsSchema` type requires). These
 * lifecycle tests don't exercise remote-controller typing — they just need a
 * concrete schema to satisfy the generic `createSession` signature.
 */
const contracts = z.discriminatedUnion('componentType', [
  z.strictObject({
    componentType: z.literal('pagination'),
    state: z.strictObject({page: z.number()}),
    actions: z.strictObject({
      selectPage: z.strictObject({payload: z.strictObject({page: z.number()})}),
    }),
  }),
]);

const baseConfig: SessionConfig<typeof contracts> = {
  organizationId: 'org-1',
  accessToken: 'token-1',
  contracts,
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

  describe('submit guard while streaming', () => {
    it('ignores submit while a turn is streaming and leaves turns unchanged', async () => {
      const session = createSession(baseConfig);

      const first = queueStream();
      const submitPromise = session.submit({prompt: 'first'});
      await first.opened;

      expect(session.turns).toHaveLength(1);
      expect(session.turns[0].status).toBe('streaming');

      await session.submit({prompt: 'second'});

      expect(callMock).toHaveBeenCalledTimes(1);
      expect(session.turns).toHaveLength(1);
      expect(session.turns[0].input.prompt).toBe('first');

      first.emit({type: 'RUN_FINISHED'});
      first.close();
      await submitPromise;
    });
  });

  describe('dispatchAction guard while streaming', () => {
    it('ignores dispatchAction while a turn is streaming and leaves turns unchanged', async () => {
      const session = createSession(baseConfig);

      const first = queueStream();
      const submitPromise = session.submit({prompt: 'first'});
      await first.opened;

      const turnsBefore = session.turns;
      expect(turnsBefore).toHaveLength(1);
      expect(turnsBefore[0].status).toBe('streaming');

      await session.dispatchAction({
        componentId: 'pagination-1',
        componentType: 'pagination',
        action: 'selectPage',
        payload: {page: 2},
      });

      // Only the original submit call reached the endpoint.
      expect(callMock).toHaveBeenCalledTimes(1);
      expect(session.turns).toHaveLength(1);
      expect(session.turns[0]).toBe(turnsBefore[0]);

      first.emit({type: 'RUN_FINISHED'});
      first.close();
      await submitPromise;
    });
  });

  describe('cancel during an in-flight stream', () => {
    it('stops the stream, retains the partial response, and sets the active turn to error', async () => {
      const session = createSession(baseConfig);

      const first = queueStream();
      const submitPromise = session.submit({prompt: 'find shoes'});
      await first.opened;

      // Fold a partial response before cancelling.
      first.emit({type: 'STATE_SNAPSHOT', snapshot: {theme: 'dark'}});
      await flush();

      expect(session.turns[0].response.state).toEqual({theme: 'dark'});
      expect(session.turns[0].status).toBe('streaming');

      session.cancel();
      await submitPromise;

      const turn = session.turns[0];
      expect(turn.status).toBe('error');
      expect(turn.error).toBeDefined();
      // Partial response already folded is retained.
      expect(turn.response.state).toEqual({theme: 'dark'});
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
      const submitPromise = session.submit({prompt: 'hi'});
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
      const submitPromise = session.submit({prompt: 'find shoes'});
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
      const submitPromise = session.submit({prompt: 'hi'});
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
});
