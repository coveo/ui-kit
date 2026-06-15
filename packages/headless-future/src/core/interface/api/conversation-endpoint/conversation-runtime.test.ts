import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import type {ConversationEndpointCallResult} from './conversation-endpoint-types.js';
import {
  ConversationRuntime,
  type ConversationRuntimeStatePort,
} from './conversation-runtime.js';

const TEST_ID = 'test-id';

const {mockCallEndpoint, mockReadConversationEventStream} = vi.hoisted(() => {
  return {
    mockCallEndpoint: vi.fn(),
    mockReadConversationEventStream: vi.fn(),
  };
});

vi.mock('./conversation-endpoint-facade.js', () => {
  return {
    ConversationEndpointFacade: {
      getInstance: vi.fn(() => ({
        callEndpoint: mockCallEndpoint,
      })),
    },
  };
});

vi.mock(
  '@/src/api/interface/conversation-endpoint/conversation-event-stream.js',
  () => {
    return {
      readConversationEventStream: mockReadConversationEventStream,
    };
  }
);

type MockEngine = FullEngine & {
  mutate: ReturnType<typeof vi.fn>;
  read: ReturnType<typeof vi.fn>;
  adoptSlice: ReturnType<typeof vi.fn>;
};

const createMockEngine = (
  session: {conversationSessionId?: string; conversationToken?: string} = {}
): MockEngine => {
  return {
    mutate: vi.fn(),
    read: vi.fn((selector) =>
      selector({
        [`${TEST_ID}/conversation`]: {
          session,
        },
      })
    ),
    adoptSlice: vi.fn(),
  } as unknown as MockEngine;
};

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;

  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return {promise, resolve, reject};
};

const getMutations = (engine: MockEngine) =>
  engine.mutate.mock.calls.map(([mutation]) => mutation);

const createConversationStatePort = (
  engine: MockEngine
): ConversationRuntimeStatePort => {
  return {
    readSession: () =>
      engine.read((state) => state[`${TEST_ID}/conversation`]?.session ?? {}),
    setSession: (session) => {
      engine.mutate({
        type: `${TEST_ID}/conversation/setSession`,
        payload: session,
      });
    },
    patchSession: (sessionPatch) => {
      engine.mutate({
        type: `${TEST_ID}/conversation/patchSession`,
        payload: sessionPatch,
      });
    },
    setError: (error) => {
      engine.mutate({
        type: `${TEST_ID}/conversation/setError`,
        payload: error,
      });
    },
    startTurn: (payload) => {
      engine.mutate({
        type: `${TEST_ID}/conversation/startTurn`,
        payload,
      });
    },
    abortTurn: (payload) => {
      engine.mutate({
        type: `${TEST_ID}/conversation/abortTurn`,
        payload,
      });
    },
    appendAgentChunk: (payload) => {
      engine.mutate({
        type: `${TEST_ID}/conversation/appendAgentChunk`,
        payload,
      });
    },
    completeTurn: (payload) => {
      engine.mutate({
        type: `${TEST_ID}/conversation/completeTurn`,
        payload,
      });
    },
    failTurn: (payload) => {
      engine.mutate({
        type: `${TEST_ID}/conversation/failTurn`,
        payload,
      });
    },
  };
};

describe('ConversationRuntime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReadConversationEventStream.mockResolvedValue(undefined);
  });

  it('returns the same runtime instance for the same engine and interfaceId', () => {
    const engine = createMockEngine();

    const first = ConversationRuntime.getInstance(
      engine,
      TEST_ID,
      createConversationStatePort(engine)
    );
    const second = ConversationRuntime.getInstance(
      engine,
      TEST_ID,
      createConversationStatePort(engine)
    );

    expect(first).toBe(second);
  });

  it('starts turn and calls endpoint with an abort signal', async () => {
    const engine = createMockEngine();
    const runtime = ConversationRuntime.getInstance(
      engine,
      TEST_ID,
      createConversationStatePort(engine)
    );
    const stream = {} as ReadableStream<Uint8Array>;

    mockCallEndpoint.mockResolvedValue({
      success: true,
      data: {stream},
    } satisfies ConversationEndpointCallResult);
    mockReadConversationEventStream.mockImplementation(
      async ({onEvent, onDone}) => {
        onEvent({type: 'turn_complete'});
        onDone?.();
      }
    );

    await runtime.submitTurn('hello');

    expect(mockCallEndpoint).toHaveBeenCalledTimes(1);
    expect(mockCallEndpoint).toHaveBeenCalledWith(
      expect.objectContaining({
        signal: expect.any(Object),
      })
    );

    const mutations = getMutations(engine);
    expect(mutations).toContainEqual({
      type: `${TEST_ID}/conversation/startTurn`,
      payload: expect.objectContaining({
        input: 'hello',
      }),
    });
  });

  it('applies continuity overrides before the endpoint request', async () => {
    const engine = createMockEngine({
      conversationSessionId: 'existing-session',
      conversationToken: 'existing-token',
    });
    const runtime = ConversationRuntime.getInstance(
      engine,
      TEST_ID,
      createConversationStatePort(engine)
    );
    const stream = {} as ReadableStream<Uint8Array>;

    mockCallEndpoint.mockResolvedValue({
      success: true,
      data: {stream},
    } satisfies ConversationEndpointCallResult);
    mockReadConversationEventStream.mockImplementation(
      async ({onEvent, onDone}) => {
        onEvent({type: 'turn_complete'});
        onDone?.();
      }
    );

    await runtime.submitTurn('hello', {
      conversationSessionId: 'seed-session',
      conversationToken: null,
    });

    expect(engine.mutate).toHaveBeenCalledWith({
      type: `${TEST_ID}/conversation/setSession`,
      payload: {
        conversationSessionId: 'seed-session',
      },
    });
    expect(mockCallEndpoint).toHaveBeenCalledTimes(1);
  });

  it('rejects overlapping submit requests while a turn is active', async () => {
    const engine = createMockEngine();
    const runtime = ConversationRuntime.getInstance(
      engine,
      TEST_ID,
      createConversationStatePort(engine)
    );
    const callDeferred = deferred<ConversationEndpointCallResult>();
    mockCallEndpoint.mockReturnValue(callDeferred.promise);

    const firstSubmit = runtime.submitTurn('first');
    await Promise.resolve();

    await runtime.submitTurn('second');

    expect(mockCallEndpoint).toHaveBeenCalledTimes(1);
    expect(engine.mutate).toHaveBeenCalledWith({
      type: `${TEST_ID}/conversation/setError`,
      payload:
        'A conversation turn is already in progress. Please wait for completion before submitting another turn.',
    });

    callDeferred.resolve({success: false, error: 'network down'});
    await firstSubmit;
  });

  it('aborts active turn immediately and cancels pending request', async () => {
    const engine = createMockEngine();
    const runtime = ConversationRuntime.getInstance(
      engine,
      TEST_ID,
      createConversationStatePort(engine)
    );
    const callDeferred = deferred<ConversationEndpointCallResult>();
    let capturedSignal: AbortSignal | undefined;

    mockCallEndpoint.mockImplementation(
      (options: {signal?: AbortSignal} | undefined) => {
        capturedSignal = options?.signal;
        return callDeferred.promise;
      }
    );

    const submitPromise = runtime.submitTurn('hello');
    await Promise.resolve();

    runtime.abortTurn();

    expect(capturedSignal?.aborted).toBe(true);
    expect(engine.mutate).toHaveBeenCalledWith({
      type: `${TEST_ID}/conversation/abortTurn`,
      payload: expect.objectContaining({
        turnId: expect.any(String),
      }),
    });
    expect(engine.mutate).toHaveBeenCalledWith({
      type: `${TEST_ID}/conversationEndpoint/setStatus`,
      payload: 'idle',
    });
    expect(engine.mutate).toHaveBeenCalledWith({
      type: `${TEST_ID}/conversationEndpoint/setStreamingConnected`,
      payload: false,
    });

    callDeferred.resolve({success: false, error: 'The operation was aborted.'});
    await submitPromise;
  });

  it('handles stream events and completes turn on terminal event', async () => {
    const engine = createMockEngine();
    const runtime = ConversationRuntime.getInstance(
      engine,
      TEST_ID,
      createConversationStatePort(engine)
    );
    const stream = {} as ReadableStream<Uint8Array>;

    mockCallEndpoint.mockResolvedValue({
      success: true,
      data: {stream},
    } satisfies ConversationEndpointCallResult);
    mockReadConversationEventStream.mockImplementation(
      async ({onEvent, onDone}) => {
        onEvent({
          type: 'TEXT_MESSAGE_CONTENT',
          messageId: 'm-1',
          delta: 'hello',
        });
        onEvent({type: 'turn_complete'});
        onDone?.();
      }
    );

    await runtime.submitTurn('hello');

    expect(engine.mutate).toHaveBeenCalledWith({
      type: `${TEST_ID}/conversationEndpoint/setStreamingConnected`,
      payload: true,
    });
    expect(engine.mutate).toHaveBeenCalledWith({
      type: `${TEST_ID}/conversationEndpoint/setStatus`,
      payload: 'streaming',
    });
    expect(engine.mutate).toHaveBeenCalledWith({
      type: `${TEST_ID}/conversation/appendAgentChunk`,
      payload: expect.objectContaining({
        chunk: 'hello',
      }),
    });
    expect(engine.mutate).toHaveBeenCalledWith({
      type: `${TEST_ID}/conversation/completeTurn`,
      payload: expect.objectContaining({
        turnId: expect.any(String),
      }),
    });
  });

  it('fails turn when stream closes without a terminal event', async () => {
    const engine = createMockEngine();
    const runtime = ConversationRuntime.getInstance(
      engine,
      TEST_ID,
      createConversationStatePort(engine)
    );
    const stream = {} as ReadableStream<Uint8Array>;

    mockCallEndpoint.mockResolvedValue({
      success: true,
      data: {stream},
    } satisfies ConversationEndpointCallResult);
    mockReadConversationEventStream.mockImplementation(async ({onDone}) => {
      onDone?.();
    });

    await runtime.submitTurn('hello');

    expect(engine.mutate).toHaveBeenCalledWith({
      type: `${TEST_ID}/conversation/failTurn`,
      payload: expect.objectContaining({
        reason: 'stream_interrupted',
      }),
    });
  });

  it('preserves warning errors on successful completion', async () => {
    const engine = createMockEngine();
    const runtime = ConversationRuntime.getInstance(
      engine,
      TEST_ID,
      createConversationStatePort(engine)
    );
    const stream = {} as ReadableStream<Uint8Array>;

    mockCallEndpoint.mockResolvedValue({
      success: true,
      data: {stream},
    } satisfies ConversationEndpointCallResult);
    mockReadConversationEventStream.mockImplementation(
      async ({onEvent, onDone}) => {
        onEvent({
          type: 'UNKNOWN',
          event: 'mystery_event',
          payload: {},
        });
        onEvent({type: 'turn_complete'});
        onDone?.();
      }
    );

    await runtime.submitTurn('hello');

    expect(engine.mutate).toHaveBeenCalledWith({
      type: `${TEST_ID}/conversationEndpoint/setError`,
      payload:
        'Conversation stream warning: unsupported event "mystery_event".',
    });
    expect(engine.mutate).toHaveBeenCalledWith({
      type: `${TEST_ID}/conversation/completeTurn`,
      payload: expect.objectContaining({
        turnId: expect.any(String),
      }),
    });
  });

  it('does not overwrite aborted turn when pending request settles after abort', async () => {
    const engine = createMockEngine();
    const runtime = ConversationRuntime.getInstance(
      engine,
      TEST_ID,
      createConversationStatePort(engine)
    );
    const callDeferred = deferred<ConversationEndpointCallResult>();

    mockCallEndpoint.mockReturnValue(callDeferred.promise);

    const submitPromise = runtime.submitTurn('hello');
    await Promise.resolve();

    runtime.abortTurn();

    callDeferred.resolve({success: false, error: 'network down'});
    await submitPromise;

    const mutations = getMutations(engine);
    const abortCount = mutations.filter(
      (mutation) => mutation.type === `${TEST_ID}/conversation/abortTurn`
    ).length;
    const failCount = mutations.filter(
      (mutation) => mutation.type === `${TEST_ID}/conversation/failTurn`
    ).length;

    expect(abortCount).toBe(1);
    expect(failCount).toBe(0);
  });

  it('is a silent no-op when aborting without an active turn', () => {
    const engine = createMockEngine();
    const runtime = ConversationRuntime.getInstance(
      engine,
      TEST_ID,
      createConversationStatePort(engine)
    );

    runtime.abortTurn();

    expect(engine.mutate).not.toHaveBeenCalled();
  });
});
