import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import type {RawSSEEvent} from '@/src/api/internal/protocol/stream-types.js';
import type {ConversationEndpointCallResult} from './conversation-endpoint-types.js';
import {ConversationRuntime} from './conversation-runtime.js';

const {
  mockCallEndpoint,
  mockReadEventStream,
  mockParseSSEEvent,
  mockLoadConversation,
  mockLoadConversationEndpoint,
} = vi.hoisted(() => {
  return {
    mockCallEndpoint: vi.fn(),
    mockReadEventStream: vi.fn(),
    mockParseSSEEvent: vi.fn(),
    mockLoadConversation: vi.fn(),
    mockLoadConversationEndpoint: vi.fn(),
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

vi.mock('@/src/api/internal/protocol/stream.js', () => {
  return {
    readEventStream: mockReadEventStream,
  };
});

vi.mock('@/src/api/internal/protocol/sse-parser.js', () => {
  return {
    parseSSEEvent: mockParseSSEEvent,
  };
});

vi.mock('@/src/core/interface/conversation/conversation-loader.js', () => {
  return {
    loadConversation: mockLoadConversation,
  };
});

vi.mock('./conversation-endpoint-loader.js', () => {
  return {
    loadConversationEndpoint: mockLoadConversationEndpoint,
  };
});

type MockEngine = FullEngine & {
  mutate: ReturnType<typeof vi.fn>;
};

const createMockEngine = (): MockEngine => {
  return {
    mutate: vi.fn(),
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

describe('ConversationRuntime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReadEventStream.mockResolvedValue(undefined);
    mockParseSSEEvent.mockImplementation((event: RawSSEEvent) => {
      return {
        type: event.event,
      };
    });
  });

  it('returns the same runtime instance for the same engine', () => {
    const engine = createMockEngine();

    const first = ConversationRuntime.getInstance(engine);
    const second = ConversationRuntime.getInstance(engine);

    expect(first).toBe(second);
    expect(mockLoadConversation).toHaveBeenCalledTimes(1);
    expect(mockLoadConversationEndpoint).toHaveBeenCalledTimes(1);
  });

  it('starts turn and calls endpoint with an abort signal', async () => {
    const engine = createMockEngine();
    const runtime = ConversationRuntime.getInstance(engine);
    const stream = {} as ReadableStream<Uint8Array>;

    mockCallEndpoint.mockResolvedValue({
      success: true,
      data: {stream},
    } satisfies ConversationEndpointCallResult);
    mockReadEventStream.mockImplementation(async ({onEvent, onDone}) => {
      onEvent({event: 'turn_complete', data: '{}'});
      onDone?.();
    });
    mockParseSSEEvent.mockReturnValueOnce({type: 'turn_complete'});

    await runtime.submitTurn('hello');

    expect(mockCallEndpoint).toHaveBeenCalledTimes(1);
    expect(mockCallEndpoint).toHaveBeenCalledWith(
      'hello',
      expect.objectContaining({
        signal: expect.any(Object),
      })
    );

    const mutations = getMutations(engine);
    expect(mutations).toContainEqual({
      type: 'conversation/startTurn',
      payload: expect.objectContaining({
        input: 'hello',
      }),
    });
  });

  it('rejects overlapping submit requests while a turn is active', async () => {
    const engine = createMockEngine();
    const runtime = ConversationRuntime.getInstance(engine);
    const callDeferred = deferred<ConversationEndpointCallResult>();
    mockCallEndpoint.mockReturnValue(callDeferred.promise);

    const firstSubmit = runtime.submitTurn('first');
    await Promise.resolve();

    await runtime.submitTurn('second');

    expect(mockCallEndpoint).toHaveBeenCalledTimes(1);
    expect(engine.mutate).toHaveBeenCalledWith({
      type: 'conversation/setError',
      payload:
        'A conversation turn is already in progress. Please wait for completion before submitting another turn.',
    });

    callDeferred.resolve({success: false, error: 'network down'});
    await firstSubmit;
  });

  it('aborts active turn immediately and cancels pending request', async () => {
    const engine = createMockEngine();
    const runtime = ConversationRuntime.getInstance(engine);
    const callDeferred = deferred<ConversationEndpointCallResult>();
    let capturedSignal: AbortSignal | undefined;

    mockCallEndpoint.mockImplementation((_, options) => {
      capturedSignal = options?.signal;
      return callDeferred.promise;
    });

    const submitPromise = runtime.submitTurn('hello');
    await Promise.resolve();

    runtime.abortTurn();

    expect(capturedSignal?.aborted).toBe(true);
    expect(engine.mutate).toHaveBeenCalledWith({
      type: 'conversation/abortTurn',
      payload: expect.objectContaining({
        turnId: expect.any(String),
      }),
    });
    expect(engine.mutate).toHaveBeenCalledWith({
      type: 'conversationEndpoint/setStatus',
      payload: 'idle',
    });
    expect(engine.mutate).toHaveBeenCalledWith({
      type: 'conversationEndpoint/setStreamingConnected',
      payload: false,
    });

    callDeferred.resolve({success: false, error: 'The operation was aborted.'});
    await submitPromise;
  });

  it('handles stream events and completes turn on terminal event', async () => {
    const engine = createMockEngine();
    const runtime = ConversationRuntime.getInstance(engine);
    const stream = {} as ReadableStream<Uint8Array>;

    mockCallEndpoint.mockResolvedValue({
      success: true,
      data: {stream},
    } satisfies ConversationEndpointCallResult);
    mockReadEventStream.mockImplementation(async ({onEvent, onDone}) => {
      onEvent({event: 'TEXT_MESSAGE_CONTENT', data: '{"delta":"hello"}'});
      onEvent({event: 'turn_complete', data: '{}'});
      onDone?.();
    });
    mockParseSSEEvent
      .mockReturnValueOnce({
        type: 'TEXT_MESSAGE_CONTENT',
        messageId: 'm-1',
        delta: 'hello',
      })
      .mockReturnValueOnce({
        type: 'turn_complete',
      });

    await runtime.submitTurn('hello');

    expect(engine.mutate).toHaveBeenCalledWith({
      type: 'conversationEndpoint/setStreamingConnected',
      payload: true,
    });
    expect(engine.mutate).toHaveBeenCalledWith({
      type: 'conversationEndpoint/setStatus',
      payload: 'streaming',
    });
    expect(engine.mutate).toHaveBeenCalledWith({
      type: 'conversation/appendAgentChunk',
      payload: expect.objectContaining({
        chunk: 'hello',
      }),
    });
    expect(engine.mutate).toHaveBeenCalledWith({
      type: 'conversation/completeTurn',
      payload: expect.objectContaining({
        turnId: expect.any(String),
      }),
    });
  });

  it('fails turn when stream closes without a terminal event', async () => {
    const engine = createMockEngine();
    const runtime = ConversationRuntime.getInstance(engine);
    const stream = {} as ReadableStream<Uint8Array>;

    mockCallEndpoint.mockResolvedValue({
      success: true,
      data: {stream},
    } satisfies ConversationEndpointCallResult);
    mockReadEventStream.mockImplementation(async ({onDone}) => {
      onDone?.();
    });

    await runtime.submitTurn('hello');

    expect(engine.mutate).toHaveBeenCalledWith({
      type: 'conversation/failTurn',
      payload: expect.objectContaining({
        reason: 'stream_interrupted',
      }),
    });
  });

  it('preserves warning errors on successful completion', async () => {
    const engine = createMockEngine();
    const runtime = ConversationRuntime.getInstance(engine);
    const stream = {} as ReadableStream<Uint8Array>;

    mockCallEndpoint.mockResolvedValue({
      success: true,
      data: {stream},
    } satisfies ConversationEndpointCallResult);
    mockReadEventStream.mockImplementation(async ({onEvent, onDone}) => {
      onEvent({event: 'UNKNOWN', data: '{}'});
      onEvent({event: 'turn_complete', data: '{}'});
      onDone?.();
    });
    mockParseSSEEvent
      .mockReturnValueOnce({
        type: 'UNKNOWN',
        event: 'mystery_event',
        payload: {},
      })
      .mockReturnValueOnce({
        type: 'turn_complete',
      });

    await runtime.submitTurn('hello');

    expect(engine.mutate).toHaveBeenCalledWith({
      type: 'conversationEndpoint/setError',
      payload:
        'Conversation stream warning: unsupported event "mystery_event".',
    });
    expect(engine.mutate).toHaveBeenCalledWith({
      type: 'conversation/completeTurn',
      payload: expect.objectContaining({
        turnId: expect.any(String),
      }),
    });
  });

  it('does not overwrite aborted turn when pending request settles after abort', async () => {
    const engine = createMockEngine();
    const runtime = ConversationRuntime.getInstance(engine);
    const callDeferred = deferred<ConversationEndpointCallResult>();

    mockCallEndpoint.mockReturnValue(callDeferred.promise);

    const submitPromise = runtime.submitTurn('hello');
    await Promise.resolve();

    runtime.abortTurn();

    callDeferred.resolve({success: false, error: 'network down'});
    await submitPromise;

    const mutations = getMutations(engine);
    const abortCount = mutations.filter(
      (mutation) => mutation.type === 'conversation/abortTurn'
    ).length;
    const failCount = mutations.filter(
      (mutation) => mutation.type === 'conversation/failTurn'
    ).length;

    expect(abortCount).toBe(1);
    expect(failCount).toBe(0);
  });

  it('is a silent no-op when aborting without an active turn', () => {
    const engine = createMockEngine();
    const runtime = ConversationRuntime.getInstance(engine);

    runtime.abortTurn();

    expect(engine.mutate).not.toHaveBeenCalled();
  });
});
