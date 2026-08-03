import {beforeEach, describe, expect, it, vi} from 'vitest';
import {UnifiedRuntime} from './unified-runtime.js';
import type {UnifiedRuntimeConfig} from './unified-runtime.js';
import type {GenerativeStatePort} from '@/src/internal/api/generative/index.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import type {NormalizedStreamEvent} from '@/src/internal/api/protocol/stream-types.js';

const {
  mockReadEventStream,
  mockParseSSEEvent,
  mockCreateUnifiedEndpointClient,
  mockCreateUnifiedEndpointRequestSelector,
  mockGenerateId,
  mockGetEndpointClientConfiguration,
  mockHydrateFromCreateSurface,
  mockApplyDataModelUpdate,
  mockExtractA2uiOperations,
} = vi.hoisted(() => ({
  mockReadEventStream: vi.fn(),
  mockParseSSEEvent: vi.fn(),
  mockCreateUnifiedEndpointClient: vi.fn(),
  mockCreateUnifiedEndpointRequestSelector: vi.fn(),
  mockGenerateId: vi.fn(),
  mockGetEndpointClientConfiguration: vi.fn(),
  mockHydrateFromCreateSurface: vi.fn(),
  mockApplyDataModelUpdate: vi.fn(),
  mockExtractA2uiOperations: vi.fn(),
}));

vi.mock('@/src/internal/api/protocol/stream.js', () => ({
  readEventStream: mockReadEventStream,
}));

vi.mock('@/src/internal/api/protocol/sse-parser.js', () => ({
  parseSSEEvent: mockParseSSEEvent,
}));

vi.mock('./unified-endpoint-client.js', () => ({
  createUnifiedEndpointClient: mockCreateUnifiedEndpointClient,
}));

vi.mock('./unified-request-selector.js', () => ({
  createUnifiedEndpointRequestSelector: mockCreateUnifiedEndpointRequestSelector,
}));

vi.mock('@/src/internal/features/configuration/index.js', () => ({
  getOrCreateConfigurationSelectors: () => ({
    getEndpointClientConfiguration: mockGetEndpointClientConfiguration,
  }),
}));

vi.mock('@/src/internal/utils/index.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/src/internal/utils/index.js')>();
  return {
    ...actual,
    generateId: mockGenerateId,
  };
});

vi.mock('./unified-surface-hydration.js', () => ({
  hydrateFromCreateSurface: mockHydrateFromCreateSurface,
  applyDataModelUpdate: mockApplyDataModelUpdate,
  extractA2uiOperations: mockExtractA2uiOperations,
}));

function createMockStatePort(): GenerativeStatePort {
  return {
    createTurn: vi.fn(),
    setActiveTurnId: vi.fn(),
    replaceTurnId: vi.fn(),
    setRoutedInterface: vi.fn(),
    initAgentResponse: vi.fn(),
    startMessage: vi.fn(),
    appendMessageDelta: vi.fn(),
    appendSurface: vi.fn(),
    startToolCall: vi.fn(),
    appendToolCallArgs: vi.fn(),
    completeToolCall: vi.fn(),
    completeTurn: vi.fn(),
    failTurn: vi.fn(),
    clearTurnResponse: vi.fn(),
    startReasoning: vi.fn(),
    appendReasoningDelta: vi.fn(),
    endReasoning: vi.fn(),
    setConversationSession: vi.fn(),
  };
}

function createMockEngine(): FullEngine {
  return {
    read: vi.fn().mockImplementation((selector: unknown) => {
      if (selector === mockGetEndpointClientConfiguration) {
        return {
          organizationId: 'test-org',
          accessToken: 'test-token',
          endpoint: undefined,
        };
      }
      return {
        trackingId: 'test-tracking',
        language: 'en',
        country: 'US',
        currency: 'USD',
        message: 'test prompt',
        cart: [],
        conversationSessionId: 'session-1',
        conversationToken: 'token-1',
      };
    }),
    getNavigatorContextProvider: vi.fn().mockReturnValue(() => ({
      clientId: 'test-client-id',
      location: 'https://example.com',
      referrer: 'https://referrer.com',
      userAgent: 'TestAgent/1.0',
    })),
  } as unknown as FullEngine;
}

function createMockConfig(overrides: Partial<UnifiedRuntimeConfig> = {}): UnifiedRuntimeConfig {
  return {
    statePort: createMockStatePort(),
    generativeInterface: {disposed: false, dispose: vi.fn()} as InterfaceHandle,
    cartInterface: {disposed: false, dispose: vi.fn()} as InterfaceHandle,
    ...overrides,
  };
}

function setupSuccessfulStream(events: NormalizedStreamEvent[]) {
  const mockStream = {} as ReadableStream<Uint8Array>;
  const mockClient = {
    call: vi.fn().mockResolvedValue({success: true, data: {stream: mockStream}}),
  };
  mockCreateUnifiedEndpointClient.mockReturnValue(mockClient);

  mockParseSSEEvent.mockImplementation((raw: unknown) => raw);

  mockReadEventStream.mockImplementation(async ({onEvent, onDone}: any) => {
    for (const event of events) {
      onEvent(event);
    }
    onDone?.();
  });

  return {mockStream, mockClient};
}

describe('UnifiedRuntime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateUnifiedEndpointRequestSelector.mockReturnValue((state: unknown) => state);
    mockGenerateId.mockReturnValue('generated-id-1');
    mockExtractA2uiOperations.mockReturnValue([]);
  });

  describe('getInstance', () => {
    it('returns the same instance for the same engine and interfaceId', () => {
      const engine = createMockEngine();
      const config = createMockConfig();

      const instance1 = UnifiedRuntime.getInstance(engine, 'iface-1', config);
      const instance2 = UnifiedRuntime.getInstance(engine, 'iface-1', config);

      expect(instance1).toBe(instance2);
    });

    it('returns different instances for different interfaceIds', () => {
      const engine = createMockEngine();
      const config = createMockConfig();

      const instance1 = UnifiedRuntime.getInstance(engine, 'iface-1', config);
      const instance2 = UnifiedRuntime.getInstance(engine, 'iface-2', config);

      expect(instance1).not.toBe(instance2);
    });

    it('returns different instances for different engines', () => {
      const engine1 = createMockEngine();
      const engine2 = createMockEngine();
      const config = createMockConfig();

      const instance1 = UnifiedRuntime.getInstance(engine1, 'iface-1', config);
      const instance2 = UnifiedRuntime.getInstance(engine2, 'iface-1', config);

      expect(instance1).not.toBe(instance2);
    });
  });

  describe('submit', () => {
    it('creates a turn with a generated id and streaming status', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      setupSuccessfulStream([{type: 'turn_complete'} as NormalizedStreamEvent]);

      const runtime = UnifiedRuntime.getInstance(engine, 'submit-create', config);
      await runtime.submit('Hello');

      expect(mockGenerateId).toHaveBeenCalled();
      expect(config.statePort.createTurn).toHaveBeenCalledWith({
        id: 'generated-id-1',
        prompt: 'Hello',
        status: 'streaming',
      });
    });

    it('sets the active turn id', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      setupSuccessfulStream([{type: 'turn_complete'} as NormalizedStreamEvent]);

      const runtime = UnifiedRuntime.getInstance(engine, 'submit-active', config);
      await runtime.submit('Hello');

      expect(config.statePort.setActiveTurnId).toHaveBeenCalledWith('generated-id-1');
    });

    it('builds the request with navigator context', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      const {mockClient} = setupSuccessfulStream([
        {type: 'turn_complete'} as NormalizedStreamEvent,
      ]);

      const runtime = UnifiedRuntime.getInstance(engine, 'nav-ctx', config);
      await runtime.submit('Hello');

      expect(mockClient.call).toHaveBeenCalledWith(
        expect.objectContaining({
          agentInput: expect.objectContaining({
            clientId: 'test-client-id',
            context: expect.objectContaining({
              user: {userAgent: 'TestAgent/1.0'},
              view: {
                url: 'https://example.com',
                referrer: 'https://referrer.com',
              },
            }),
          }),
        }),
        expect.anything(),
        expect.anything()
      );
    });

    it('fails the turn when the API call returns an error', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      const mockClient = {
        call: vi.fn().mockResolvedValue({success: false, error: 'API error'}),
      };
      mockCreateUnifiedEndpointClient.mockReturnValue(mockClient);

      const runtime = UnifiedRuntime.getInstance(engine, 'api-fail', config);
      await runtime.submit('Hello');

      expect(config.statePort.failTurn).toHaveBeenCalledWith('generated-id-1', 'API error');
    });

    it('fails the turn when an exception is thrown', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      mockCreateUnifiedEndpointClient.mockReturnValue({
        call: vi.fn().mockRejectedValue(new Error('network failure')),
      });

      const runtime = UnifiedRuntime.getInstance(engine, 'exception', config);
      await runtime.submit('Hello');

      expect(config.statePort.failTurn).toHaveBeenCalledWith('generated-id-1', 'network failure');
    });

    it('fails the turn with a default message for non-Error exceptions', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      mockCreateUnifiedEndpointClient.mockReturnValue({
        call: vi.fn().mockRejectedValue(42),
      });

      const runtime = UnifiedRuntime.getInstance(engine, 'non-error', config);
      await runtime.submit('Hello');

      expect(config.statePort.failTurn).toHaveBeenCalledWith(
        'generated-id-1',
        'An unexpected error occurred while reading the conversation stream.'
      );
    });
  });

  describe('resubmit', () => {
    it('clears the turn response and recreates it with streaming status', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      setupSuccessfulStream([{type: 'turn_complete'} as NormalizedStreamEvent]);

      const runtime = UnifiedRuntime.getInstance(engine, 'resubmit', config);
      await runtime.resubmit('existing-turn-id', 'Updated prompt');

      expect(config.statePort.clearTurnResponse).toHaveBeenCalledWith('existing-turn-id');
      expect(config.statePort.createTurn).toHaveBeenCalledWith({
        id: 'existing-turn-id',
        prompt: 'Updated prompt',
        status: 'streaming',
      });
    });

    it('resets agent response initialization for the turn', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      setupSuccessfulStream([
        {type: 'TEXT_MESSAGE_START', role: 'assistant'} as NormalizedStreamEvent,
        {type: 'turn_complete'} as NormalizedStreamEvent,
      ]);

      const runtime = UnifiedRuntime.getInstance(engine, 'resubmit-reset', config);
      await runtime.submit('First');

      expect(config.statePort.initAgentResponse).toHaveBeenCalledTimes(1);

      setupSuccessfulStream([
        {type: 'TEXT_MESSAGE_START', role: 'assistant'} as NormalizedStreamEvent,
        {type: 'turn_complete'} as NormalizedStreamEvent,
      ]);

      await runtime.resubmit('generated-id-1', 'Second');

      expect(config.statePort.initAgentResponse).toHaveBeenCalledTimes(2);
    });
  });

  describe('stream consumption', () => {
    it('fails the turn when stream ends without a terminal event', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      const mockStream = {} as ReadableStream<Uint8Array>;
      mockCreateUnifiedEndpointClient.mockReturnValue({
        call: vi.fn().mockResolvedValue({success: true, data: {stream: mockStream}}),
      });
      mockParseSSEEvent.mockImplementation((raw: unknown) => raw);
      mockReadEventStream.mockImplementation(async ({onEvent, onDone}: any) => {
        onEvent({type: 'TEXT_MESSAGE_CONTENT', delta: 'hello'});
        onDone?.();
      });

      const runtime = UnifiedRuntime.getInstance(engine, 'no-terminal', config);
      await runtime.submit('Hello');

      expect(config.statePort.failTurn).toHaveBeenCalledWith(
        'generated-id-1',
        'Stream ended without a terminal event.'
      );
    });

    it('fails the turn when stream encounters an error', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      const mockStream = {} as ReadableStream<Uint8Array>;
      mockCreateUnifiedEndpointClient.mockReturnValue({
        call: vi.fn().mockResolvedValue({success: true, data: {stream: mockStream}}),
      });
      mockParseSSEEvent.mockImplementation((raw: unknown) => raw);
      mockReadEventStream.mockImplementation(async ({onError}: any) => {
        onError?.(new Error('stream read failure'));
      });

      const runtime = UnifiedRuntime.getInstance(engine, 'stream-err', config);
      await runtime.submit('Hello');

      expect(config.statePort.failTurn).toHaveBeenCalledWith(
        'generated-id-1',
        'stream read failure'
      );
    });
  });

  describe('event dispatch', () => {
    it('handles turn_started by setting the conversation session', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      setupSuccessfulStream([
        {
          type: 'turn_started',
          conversationSessionId: 'session-123',
          conversationToken: 'token-abc',
        } as NormalizedStreamEvent,
        {type: 'turn_complete'} as NormalizedStreamEvent,
      ]);

      const runtime = UnifiedRuntime.getInstance(engine, 'turn-started', config);
      await runtime.submit('Hello');

      expect(config.statePort.setConversationSession).toHaveBeenCalledWith(
        'session-123',
        'token-abc'
      );
    });

    it('handles TEXT_MESSAGE_START by initializing agent response and starting message', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      setupSuccessfulStream([
        {type: 'TEXT_MESSAGE_START', role: 'assistant'} as NormalizedStreamEvent,
        {type: 'turn_complete'} as NormalizedStreamEvent,
      ]);

      const runtime = UnifiedRuntime.getInstance(engine, 'msg-start', config);
      await runtime.submit('Hello');

      expect(config.statePort.initAgentResponse).toHaveBeenCalledWith('generated-id-1');
      expect(config.statePort.startMessage).toHaveBeenCalledWith('generated-id-1', 'assistant');
    });

    it('handles TEXT_MESSAGE_CONTENT by appending delta', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      setupSuccessfulStream([
        {type: 'TEXT_MESSAGE_CONTENT', delta: 'Hello '} as NormalizedStreamEvent,
        {type: 'TEXT_MESSAGE_CONTENT', delta: 'world'} as NormalizedStreamEvent,
        {type: 'turn_complete'} as NormalizedStreamEvent,
      ]);

      const runtime = UnifiedRuntime.getInstance(engine, 'msg-content', config);
      await runtime.submit('Hello');

      expect(config.statePort.appendMessageDelta).toHaveBeenCalledWith('generated-id-1', 'Hello ');
      expect(config.statePort.appendMessageDelta).toHaveBeenCalledWith('generated-id-1', 'world');
    });

    it('handles TEXT_MESSAGE_END without side effects', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      setupSuccessfulStream([
        {type: 'TEXT_MESSAGE_START', role: 'assistant'} as NormalizedStreamEvent,
        {type: 'TEXT_MESSAGE_CONTENT', delta: 'hi'} as NormalizedStreamEvent,
        {type: 'TEXT_MESSAGE_END'} as NormalizedStreamEvent,
        {type: 'turn_complete'} as NormalizedStreamEvent,
      ]);

      const runtime = UnifiedRuntime.getInstance(engine, 'msg-end', config);
      await runtime.submit('Hello');

      expect(config.statePort.completeTurn).toHaveBeenCalledWith('generated-id-1');
    });

    it('handles REASONING_MESSAGE_START/CONTENT/END lifecycle', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      setupSuccessfulStream([
        {type: 'REASONING_MESSAGE_START'} as NormalizedStreamEvent,
        {type: 'REASONING_MESSAGE_CONTENT', delta: 'thinking...'} as NormalizedStreamEvent,
        {type: 'REASONING_MESSAGE_END'} as NormalizedStreamEvent,
        {type: 'turn_complete'} as NormalizedStreamEvent,
      ]);

      const runtime = UnifiedRuntime.getInstance(engine, 'reasoning', config);
      await runtime.submit('Hello');

      expect(config.statePort.startReasoning).toHaveBeenCalledWith('generated-id-1');
      expect(config.statePort.appendReasoningDelta).toHaveBeenCalledWith(
        'generated-id-1',
        'thinking...'
      );
      expect(config.statePort.endReasoning).toHaveBeenCalledWith('generated-id-1');
    });

    it('handles TOOL_CALL_START/ARGS/END/RESULT lifecycle', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      setupSuccessfulStream([
        {
          type: 'TOOL_CALL_START',
          toolCallId: 'tc-1',
          toolCallName: 'search',
        } as NormalizedStreamEvent,
        {
          type: 'TOOL_CALL_ARGS',
          toolCallId: 'tc-1',
          delta: '{"query":"test"}',
        } as NormalizedStreamEvent,
        {type: 'TOOL_CALL_END', toolCallId: 'tc-1'} as NormalizedStreamEvent,
        {
          type: 'TOOL_CALL_RESULT',
          toolCallId: 'tc-1',
          content: '{"results":[]}',
        } as NormalizedStreamEvent,
        {type: 'turn_complete'} as NormalizedStreamEvent,
      ]);

      const runtime = UnifiedRuntime.getInstance(engine, 'tool-call', config);
      await runtime.submit('Hello');

      expect(config.statePort.startToolCall).toHaveBeenCalledWith(
        'generated-id-1',
        'tc-1',
        'search'
      );
      expect(config.statePort.appendToolCallArgs).toHaveBeenCalledWith(
        'generated-id-1',
        'tc-1',
        '{"query":"test"}'
      );
      expect(config.statePort.completeToolCall).toHaveBeenCalledWith(
        'generated-id-1',
        'tc-1',
        '{"results":[]}'
      );
    });

    it('handles ACTIVITY_SNAPSHOT by appending surface', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      const surface = {component: 'product-card', data: {id: 'p1'}};
      setupSuccessfulStream([
        {
          type: 'ACTIVITY_SNAPSHOT',
          messageId: 'm1',
          activityType: 'ui-surface',
          content: surface,
          replace: false,
        } as unknown as NormalizedStreamEvent,
        {type: 'turn_complete'} as NormalizedStreamEvent,
      ]);

      const runtime = UnifiedRuntime.getInstance(engine, 'activity', config);
      await runtime.submit('Hello');

      expect(config.statePort.appendSurface).toHaveBeenCalledWith('generated-id-1', surface);
    });

    it('handles RUN_ERROR by failing the turn with the error message', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      setupSuccessfulStream([
        {type: 'RUN_ERROR', message: 'Agent encountered an error'} as NormalizedStreamEvent,
      ]);

      const runtime = UnifiedRuntime.getInstance(engine, 'run-error', config);
      await runtime.submit('Hello');

      expect(config.statePort.failTurn).toHaveBeenCalledWith(
        'generated-id-1',
        'Agent encountered an error'
      );
    });

    it('handles RUN_ERROR with empty message using default', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      setupSuccessfulStream([{type: 'RUN_ERROR', message: ''} as NormalizedStreamEvent]);

      const runtime = UnifiedRuntime.getInstance(engine, 'run-error-empty', config);
      await runtime.submit('Hello');

      expect(config.statePort.failTurn).toHaveBeenCalledWith(
        'generated-id-1',
        'An error occurred during the turn.'
      );
    });

    it('treats RUN_FINISHED as NOT terminal — events continue after it', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      setupSuccessfulStream([
        {type: 'RUN_FINISHED'} as NormalizedStreamEvent,
        {type: 'TEXT_MESSAGE_START', role: 'assistant'} as NormalizedStreamEvent,
        {type: 'TEXT_MESSAGE_CONTENT', delta: 'after run'} as NormalizedStreamEvent,
        {type: 'turn_complete'} as NormalizedStreamEvent,
      ]);

      const runtime = UnifiedRuntime.getInstance(engine, 'run-finished', config);
      await runtime.submit('Hello');

      expect(config.statePort.startMessage).toHaveBeenCalledWith('generated-id-1', 'assistant');
      expect(config.statePort.appendMessageDelta).toHaveBeenCalledWith(
        'generated-id-1',
        'after run'
      );
      expect(config.statePort.completeTurn).toHaveBeenCalledTimes(1);
      expect(config.statePort.completeTurn).toHaveBeenCalledWith('generated-id-1');
    });

    it('handles turn_complete by completing the turn and updating session', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      setupSuccessfulStream([
        {
          type: 'turn_complete',
          conversationSessionId: 'final-session',
          conversationToken: 'final-token',
        } as NormalizedStreamEvent,
      ]);

      const runtime = UnifiedRuntime.getInstance(engine, 'turn-complete', config);
      await runtime.submit('Hello');

      expect(config.statePort.setConversationSession).toHaveBeenCalledWith(
        'final-session',
        'final-token'
      );
      expect(config.statePort.completeTurn).toHaveBeenCalledWith('generated-id-1');
    });

    it('ignores RUN_STARTED events', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      setupSuccessfulStream([
        {type: 'RUN_STARTED'} as NormalizedStreamEvent,
        {type: 'turn_complete'} as NormalizedStreamEvent,
      ]);

      const runtime = UnifiedRuntime.getInstance(engine, 'run-started', config);
      await runtime.submit('Hello');

      expect(config.statePort.completeTurn).toHaveBeenCalled();
    });

    it('ignores STATE_SNAPSHOT events', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      setupSuccessfulStream([
        {type: 'STATE_SNAPSHOT'} as NormalizedStreamEvent,
        {type: 'turn_complete'} as NormalizedStreamEvent,
      ]);

      const runtime = UnifiedRuntime.getInstance(engine, 'state-snap', config);
      await runtime.submit('Hello');

      expect(config.statePort.completeTurn).toHaveBeenCalled();
    });

    it('ignores CUSTOM events', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      setupSuccessfulStream([
        {type: 'CUSTOM', name: 'test', value: {}} as NormalizedStreamEvent,
        {type: 'turn_complete'} as NormalizedStreamEvent,
      ]);

      const runtime = UnifiedRuntime.getInstance(engine, 'custom-evt', config);
      await runtime.submit('Hello');

      expect(config.statePort.completeTurn).toHaveBeenCalled();
    });

    it('ignores unknown event types', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      setupSuccessfulStream([
        {type: 'UNKNOWN_EVENT_TYPE'} as unknown as NormalizedStreamEvent,
        {type: 'turn_complete'} as NormalizedStreamEvent,
      ]);

      const runtime = UnifiedRuntime.getInstance(engine, 'unknown-evt', config);
      await runtime.submit('Hello');

      expect(config.statePort.completeTurn).toHaveBeenCalled();
    });
  });

  describe('ensureAgentResponse idempotency', () => {
    it('calls initAgentResponse only once per turn', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      setupSuccessfulStream([
        {type: 'TEXT_MESSAGE_START', role: 'assistant'} as NormalizedStreamEvent,
        {type: 'TEXT_MESSAGE_CONTENT', delta: 'a'} as NormalizedStreamEvent,
        {type: 'REASONING_MESSAGE_START'} as NormalizedStreamEvent,
        {
          type: 'TOOL_CALL_START',
          toolCallId: 'tc-1',
          toolCallName: 'x',
        } as NormalizedStreamEvent,
        {type: 'turn_complete'} as NormalizedStreamEvent,
      ]);

      const runtime = UnifiedRuntime.getInstance(engine, 'idempotent', config);
      await runtime.submit('Hello');

      expect(config.statePort.initAgentResponse).toHaveBeenCalledTimes(1);
    });
  });

  describe('navigator context handling', () => {
    it('handles null navigator context provider', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      (engine.getNavigatorContextProvider as ReturnType<typeof vi.fn>).mockReturnValue(undefined);
      const {mockClient} = setupSuccessfulStream([
        {type: 'turn_complete'} as NormalizedStreamEvent,
      ]);

      const runtime = UnifiedRuntime.getInstance(engine, 'no-nav', config);
      await runtime.submit('Hello');

      expect(mockClient.call).toHaveBeenCalledWith(
        expect.objectContaining({
          agentInput: expect.objectContaining({
            clientId: undefined,
            context: expect.objectContaining({
              user: {userAgent: null},
              view: {url: null, referrer: null},
            }),
          }),
        }),
        expect.anything(),
        expect.anything()
      );
    });
  });

  describe('cancel and abort', () => {
    it('cancel() aborts active stream and fails turn with Cancelled', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      const mockClient = {
        call: vi.fn().mockResolvedValue({
          success: true,
          data: {stream: {} as ReadableStream<Uint8Array>},
        }),
      };
      mockCreateUnifiedEndpointClient.mockReturnValue(mockClient);
      mockParseSSEEvent.mockImplementation((raw: unknown) => raw);

      mockReadEventStream.mockImplementation(async ({onError}: any) => {
        const abortError = new Error('The operation was aborted.');
        abortError.name = 'AbortError';
        onError?.(abortError);
        throw abortError;
      });

      const runtime = UnifiedRuntime.getInstance(engine, 'cancel-test', config);
      await runtime.submit('Hello');

      expect(config.statePort.failTurn).toHaveBeenCalledWith('generated-id-1', 'Cancelled');
    });

    it('cancel() when no active stream is a no-op', () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      setupSuccessfulStream([]);

      const runtime = UnifiedRuntime.getInstance(engine, 'cancel-noop', config);
      runtime.cancel();

      expect(config.statePort.failTurn).not.toHaveBeenCalled();
    });

    it('submit() aborts previous active stream before starting new one', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      mockParseSSEEvent.mockImplementation((raw: unknown) => raw);

      let firstStreamResolve: (() => void) | undefined;
      let callCount = 0;

      mockCreateUnifiedEndpointClient.mockReturnValue({
        call: vi.fn().mockResolvedValue({
          success: true,
          data: {stream: {} as ReadableStream<Uint8Array>},
        }),
      });

      mockReadEventStream.mockImplementation(async ({onEvent, onDone, onError}: any) => {
        callCount++;
        if (callCount === 1) {
          await new Promise<void>((resolve) => {
            firstStreamResolve = resolve;
          });
          const abortError = new Error('The operation was aborted.');
          abortError.name = 'AbortError';
          onError?.(abortError);
          throw abortError;
        } else {
          onEvent({type: 'turn_complete'});
          onDone?.();
        }
      });

      const runtime = UnifiedRuntime.getInstance(engine, 'submit-aborts', config);
      const firstSubmit = runtime.submit('First');
      await Promise.resolve();

      mockGenerateId.mockReturnValue('generated-id-2');
      const secondSubmit = runtime.submit('Second');
      firstStreamResolve?.();

      await Promise.allSettled([firstSubmit, secondSubmit]);

      expect(config.statePort.failTurn).toHaveBeenCalledWith('generated-id-1', 'Cancelled');
      expect(config.statePort.completeTurn).toHaveBeenCalledWith('generated-id-2');
    });

    it('resubmit() aborts previous active stream before starting new one', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      mockParseSSEEvent.mockImplementation((raw: unknown) => raw);

      let firstStreamResolve: (() => void) | undefined;
      let callCount = 0;

      mockCreateUnifiedEndpointClient.mockReturnValue({
        call: vi.fn().mockResolvedValue({
          success: true,
          data: {stream: {} as ReadableStream<Uint8Array>},
        }),
      });

      mockReadEventStream.mockImplementation(async ({onEvent, onDone, onError}: any) => {
        callCount++;
        if (callCount === 1) {
          await new Promise<void>((resolve) => {
            firstStreamResolve = resolve;
          });
          const abortError = new Error('The operation was aborted.');
          abortError.name = 'AbortError';
          onError?.(abortError);
          throw abortError;
        } else {
          onEvent({type: 'turn_complete'});
          onDone?.();
        }
      });

      const runtime = UnifiedRuntime.getInstance(engine, 'resubmit-aborts', config);
      const firstSubmit = runtime.submit('First');
      await Promise.resolve();

      const resubmitPromise = runtime.resubmit('generated-id-1', 'Retry');
      firstStreamResolve?.();

      await Promise.allSettled([firstSubmit, resubmitPromise]);

      expect(config.statePort.failTurn).toHaveBeenCalledWith('generated-id-1', 'Cancelled');
      expect(config.statePort.completeTurn).toHaveBeenCalledWith('generated-id-1');
    });

    it('handles AbortError from stream reading as cancellation', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      mockParseSSEEvent.mockImplementation((raw: unknown) => raw);

      mockCreateUnifiedEndpointClient.mockReturnValue({
        call: vi.fn().mockResolvedValue({
          success: true,
          data: {stream: {} as ReadableStream<Uint8Array>},
        }),
      });

      mockReadEventStream.mockImplementation(async ({onError}: any) => {
        const abortError = new Error('The operation was aborted.');
        abortError.name = 'AbortError';
        onError?.(abortError);
        throw abortError;
      });

      const runtime = UnifiedRuntime.getInstance(engine, 'abort-stream', config);
      await runtime.submit('Hello');

      expect(config.statePort.failTurn).toHaveBeenCalledWith('generated-id-1', 'Cancelled');
    });

    it('handles AbortError from client call as cancellation', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();

      const abortError = new Error('The operation was aborted.');
      abortError.name = 'AbortError';

      mockCreateUnifiedEndpointClient.mockReturnValue({
        call: vi.fn().mockRejectedValue(abortError),
      });

      const runtime = UnifiedRuntime.getInstance(engine, 'abort-fetch', config);
      await runtime.submit('Hello');

      expect(config.statePort.failTurn).toHaveBeenCalledWith('generated-id-1', 'Cancelled');
    });

    it('activeAbortController is cleaned up after stream completes', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      setupSuccessfulStream([{type: 'turn_complete'} as NormalizedStreamEvent]);

      const runtime = UnifiedRuntime.getInstance(engine, 'cleanup', config);
      await runtime.submit('Hello');

      runtime.cancel();
      expect(config.statePort.failTurn).not.toHaveBeenCalledWith(expect.anything(), 'Cancelled');
    });
  });

  describe('gateway error event', () => {
    it('handles gateway error event as terminal with session update', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      setupSuccessfulStream([
        {
          type: 'error',
          conversationSessionId: 'err-session',
          conversationToken: 'err-token',
          error: {message: 'Gateway timeout'},
        } as any,
      ]);

      const runtime = UnifiedRuntime.getInstance(engine, 'gateway-err', config);
      await runtime.submit('Hello');

      expect(config.statePort.setConversationSession).toHaveBeenCalledWith(
        'err-session',
        'err-token'
      );
      expect(config.statePort.failTurn).toHaveBeenCalledWith('generated-id-1', 'Gateway timeout');
    });

    it('handles gateway error event with default message when error object lacks message', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      setupSuccessfulStream([
        {
          type: 'error',
          conversationSessionId: 'err-session-2',
          conversationToken: 'err-token-2',
          error: {code: 500},
        } as any,
      ]);

      const runtime = UnifiedRuntime.getInstance(engine, 'gateway-err-default', config);
      await runtime.submit('Hello');

      expect(config.statePort.failTurn).toHaveBeenCalledWith(
        'generated-id-1',
        'A gateway error occurred.'
      );
    });
  });

  describe('a2ui-surface dispatch', () => {
    function createMockInterface() {
      return {disposed: false, dispose: vi.fn()} as InterfaceHandle;
    }

    it('non-a2ui-surface ACTIVITY_SNAPSHOT only calls appendSurface', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      const surface = {data: 'x'};
      mockExtractA2uiOperations.mockReturnValue([]);

      setupSuccessfulStream([
        {
          type: 'ACTIVITY_SNAPSHOT',
          activityType: 'ui-surface',
          content: surface,
        } as unknown as NormalizedStreamEvent,
        {type: 'turn_complete'} as NormalizedStreamEvent,
      ]);

      const runtime = UnifiedRuntime.getInstance(engine, 'a2ui-non-surface', config);
      await runtime.submit('Hello');

      expect(config.statePort.appendSurface).toHaveBeenCalledWith('generated-id-1', surface);
      expect(mockHydrateFromCreateSurface).not.toHaveBeenCalled();
      expect(config.statePort.setRoutedInterface).not.toHaveBeenCalled();
    });

    it('a2ui-surface ACTIVITY_SNAPSHOT calls appendSurface AND triggers hydration', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      const mockIface = createMockInterface();
      const content = {
        operations: [{createSurface: {surfaceId: 's1', dataModel: {products: []}}}],
      };

      mockExtractA2uiOperations.mockReturnValue(content.operations);
      mockHydrateFromCreateSurface.mockReturnValue({
        surfaceId: 's1',
        useCase: 'commerceSearch',
        interface: mockIface,
        snapshot: {products: []},
        query: undefined,
      });

      setupSuccessfulStream([
        {
          type: 'ACTIVITY_SNAPSHOT',
          activityType: 'a2ui-surface',
          content,
        } as unknown as NormalizedStreamEvent,
        {type: 'turn_complete'} as NormalizedStreamEvent,
      ]);

      const runtime = UnifiedRuntime.getInstance(engine, 'a2ui-hydrate', config);
      await runtime.submit('Hello');

      expect(config.statePort.appendSurface).toHaveBeenCalledWith('generated-id-1', content);
      expect(mockHydrateFromCreateSurface).toHaveBeenCalledWith(
        engine,
        {surfaceId: 's1', dataModel: {products: []}},
        config.generativeInterface,
        config.cartInterface
      );
      expect(config.statePort.setRoutedInterface).toHaveBeenCalledWith('generated-id-1', {
        useCase: 'commerceSearch',
        interface: mockIface,
        snapshot: {products: []},
        query: undefined,
        surfaceId: 's1',
      });
    });

    it('handles multiple createSurface operations in one snapshot', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      const mockIface1 = createMockInterface();
      const mockIface2 = createMockInterface();
      const content = {
        operations: [
          {createSurface: {surfaceId: 's1', dataModel: {products: ['a']}}},
          {createSurface: {surfaceId: 's2', dataModel: {products: ['b']}}},
        ],
      };

      mockExtractA2uiOperations.mockReturnValue(content.operations);
      mockHydrateFromCreateSurface
        .mockReturnValueOnce({
          surfaceId: 's1',
          useCase: 'commerceSearch',
          interface: mockIface1,
          snapshot: {products: ['a']},
          query: undefined,
        })
        .mockReturnValueOnce({
          surfaceId: 's2',
          useCase: 'commerceSearch',
          interface: mockIface2,
          snapshot: {products: ['b']},
          query: undefined,
        });

      setupSuccessfulStream([
        {
          type: 'ACTIVITY_SNAPSHOT',
          activityType: 'a2ui-surface',
          content,
        } as unknown as NormalizedStreamEvent,
        {type: 'turn_complete'} as NormalizedStreamEvent,
      ]);

      const runtime = UnifiedRuntime.getInstance(engine, 'a2ui-multi', config);
      await runtime.submit('Hello');

      expect(mockHydrateFromCreateSurface).toHaveBeenCalledTimes(2);
      expect(config.statePort.setRoutedInterface).toHaveBeenCalledTimes(2);
      expect(config.statePort.setRoutedInterface).toHaveBeenCalledWith('generated-id-1', {
        useCase: 'commerceSearch',
        interface: mockIface1,
        snapshot: {products: ['a']},
        query: undefined,
        surfaceId: 's1',
      });
      expect(config.statePort.setRoutedInterface).toHaveBeenCalledWith('generated-id-1', {
        useCase: 'commerceSearch',
        interface: mockIface2,
        snapshot: {products: ['b']},
        query: undefined,
        surfaceId: 's2',
      });
    });

    it('updateDataModel after createSurface updates state', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      const mockIface = createMockInterface();
      const content = {
        operations: [
          {createSurface: {surfaceId: 's1', dataModel: {products: []}}},
          {updateDataModel: {surfaceId: 's1', path: '/products', value: ['new-product']}},
        ],
      };

      mockExtractA2uiOperations.mockReturnValue(content.operations);
      mockHydrateFromCreateSurface.mockReturnValue({
        surfaceId: 's1',
        useCase: 'commerceSearch',
        interface: mockIface,
        snapshot: {products: []},
        query: undefined,
      });

      setupSuccessfulStream([
        {
          type: 'ACTIVITY_SNAPSHOT',
          activityType: 'a2ui-surface',
          content,
        } as unknown as NormalizedStreamEvent,
        {type: 'turn_complete'} as NormalizedStreamEvent,
      ]);

      const runtime = UnifiedRuntime.getInstance(engine, 'a2ui-update', config);
      await runtime.submit('Hello');

      expect(mockApplyDataModelUpdate).toHaveBeenCalledWith(engine, mockIface, '/products', [
        'new-product',
      ]);
    });

    it('createSurface with already-existing surfaceId disposes old interface and registers new one', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      const oldIface = createMockInterface();
      const newIface = createMockInterface();

      const content1 = {
        operations: [{createSurface: {surfaceId: 's1', dataModel: {products: ['old']}}}],
      };
      const content2 = {
        operations: [{createSurface: {surfaceId: 's1', dataModel: {products: ['new']}}}],
      };

      mockExtractA2uiOperations
        .mockReturnValueOnce(content1.operations)
        .mockReturnValueOnce(content2.operations);
      mockHydrateFromCreateSurface
        .mockReturnValueOnce({
          surfaceId: 's1',
          useCase: 'commerceSearch',
          interface: oldIface,
          snapshot: {products: ['old']},
          query: undefined,
        })
        .mockReturnValueOnce({
          surfaceId: 's1',
          useCase: 'commerceSearch',
          interface: newIface,
          snapshot: {products: ['new']},
          query: undefined,
        });

      setupSuccessfulStream([
        {
          type: 'ACTIVITY_SNAPSHOT',
          activityType: 'a2ui-surface',
          content: content1,
        } as unknown as NormalizedStreamEvent,
        {
          type: 'ACTIVITY_SNAPSHOT',
          activityType: 'a2ui-surface',
          content: content2,
        } as unknown as NormalizedStreamEvent,
        {type: 'turn_complete'} as NormalizedStreamEvent,
      ]);

      const runtime = UnifiedRuntime.getInstance(engine, 'a2ui-recreate', config);
      await runtime.submit('Hello');

      expect(oldIface.dispose).toHaveBeenCalled();
      expect(config.statePort.setRoutedInterface).toHaveBeenLastCalledWith('generated-id-1', {
        useCase: 'commerceSearch',
        interface: newIface,
        snapshot: {products: ['new']},
        query: undefined,
        surfaceId: 's1',
      });
    });

    it('updateDataModel with path `/` calls applyDataModelUpdate with root path', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      const mockIface = createMockInterface();
      const fullModel = {products: [], facets: [], pagination: {}};
      const content = {
        operations: [
          {createSurface: {surfaceId: 's1', dataModel: {products: []}}},
          {updateDataModel: {surfaceId: 's1', path: '/', value: fullModel}},
        ],
      };

      mockExtractA2uiOperations.mockReturnValue(content.operations);
      mockHydrateFromCreateSurface.mockReturnValue({
        surfaceId: 's1',
        useCase: 'commerceSearch',
        interface: mockIface,
        snapshot: {products: []},
        query: undefined,
      });

      setupSuccessfulStream([
        {
          type: 'ACTIVITY_SNAPSHOT',
          activityType: 'a2ui-surface',
          content,
        } as unknown as NormalizedStreamEvent,
        {type: 'turn_complete'} as NormalizedStreamEvent,
      ]);

      const runtime = UnifiedRuntime.getInstance(engine, 'a2ui-root-update', config);
      await runtime.submit('Hello');

      expect(mockApplyDataModelUpdate).toHaveBeenCalledWith(engine, mockIface, '/', fullModel);
    });

    it('updateDataModel with path `/responseId` calls applyDataModelUpdate (function handles ignoring)', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      const mockIface = createMockInterface();
      const content = {
        operations: [
          {createSurface: {surfaceId: 's1', dataModel: {products: []}}},
          {updateDataModel: {surfaceId: 's1', path: '/responseId', value: 'resp-123'}},
        ],
      };

      mockExtractA2uiOperations.mockReturnValue(content.operations);
      mockHydrateFromCreateSurface.mockReturnValue({
        surfaceId: 's1',
        useCase: 'commerceSearch',
        interface: mockIface,
        snapshot: {products: []},
        query: undefined,
      });

      setupSuccessfulStream([
        {
          type: 'ACTIVITY_SNAPSHOT',
          activityType: 'a2ui-surface',
          content,
        } as unknown as NormalizedStreamEvent,
        {type: 'turn_complete'} as NormalizedStreamEvent,
      ]);

      const runtime = UnifiedRuntime.getInstance(engine, 'a2ui-responseid', config);
      await runtime.submit('Hello');

      expect(mockApplyDataModelUpdate).toHaveBeenCalledWith(
        engine,
        mockIface,
        '/responseId',
        'resp-123'
      );
    });
  });
});
