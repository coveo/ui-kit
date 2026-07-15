import {beforeEach, describe, expect, it, vi} from 'vitest';
import {GenerativeRuntime} from './generative-runtime.js';
import type {
  GenerativeRuntimeConfig,
  GenerativeStatePort,
} from './generative-runtime.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import type {ConversationStreamEvent} from '@/src/internal/api/conversation/index.js';

const {
  mockReadConversationEventStream,
  mockCreateConversationEndpointClient,
  mockCreateConversationEndpointRequestSelector,
  mockReadEndpointClientConfiguration,
  mockGenerateId,
} = vi.hoisted(() => ({
  mockReadConversationEventStream: vi.fn(),
  mockCreateConversationEndpointClient: vi.fn(),
  mockCreateConversationEndpointRequestSelector: vi.fn(),
  mockReadEndpointClientConfiguration: vi.fn(),
  mockGenerateId: vi.fn(),
}));

vi.mock('@/src/internal/api/conversation/index.js', () => ({
  readConversationEventStream: mockReadConversationEventStream,
  createConversationEndpointClient: mockCreateConversationEndpointClient,
  createConversationEndpointRequestSelector:
    mockCreateConversationEndpointRequestSelector,
}));

vi.mock('@/src/internal/features/configuration/index.js', () => ({
  readEndpointClientConfiguration: mockReadEndpointClientConfiguration,
}));

vi.mock('@/src/internal/utils/index.js', () => ({
  generateId: mockGenerateId,
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
    read: vi.fn().mockReturnValue({
      trackingId: 'test-tracking',
      language: 'en',
      country: 'US',
      currency: 'USD',
      message: 'test prompt',
    }),
    getNavigatorContextProvider: vi.fn().mockReturnValue(() => ({
      clientId: 'test-client-id',
      location: 'https://example.com',
      referrer: 'https://referrer.com',
      userAgent: 'TestAgent/1.0',
    })),
  } as unknown as FullEngine;
}

function createMockConfig(
  overrides: Partial<GenerativeRuntimeConfig> = {}
): GenerativeRuntimeConfig {
  return {
    statePort: createMockStatePort(),
    hydrateSubInterface: vi.fn().mockReturnValue(null),
    generativeInterface: {disposed: false, dispose: vi.fn()} as InterfaceHandle,
    cartInterface: {disposed: false, dispose: vi.fn()} as InterfaceHandle,
    ...overrides,
  };
}

function setupSuccessfulStream(
  events: ConversationStreamEvent[],
  {omitTerminal = false}: {omitTerminal?: boolean} = {}
) {
  const mockStream = {} as ReadableStream<Uint8Array>;
  const mockClient = {
    call: vi
      .fn()
      .mockResolvedValue({success: true, data: {stream: mockStream}}),
  };

  mockCreateConversationEndpointClient.mockReturnValue(mockClient);
  mockReadEndpointClientConfiguration.mockReturnValue({
    organizationId: 'test-org',
    accessToken: 'test-token',
  });

  mockReadConversationEventStream.mockImplementation(
    async ({onEvent, onDone}) => {
      for (const event of events) {
        onEvent(event);
      }
      if (!omitTerminal) {
        onDone?.();
      }
    }
  );

  return {mockStream, mockClient};
}

describe('GenerativeRuntime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateConversationEndpointRequestSelector.mockReturnValue(
      (state: unknown) => state
    );
    mockGenerateId.mockReturnValue('generated-id-1');
  });

  describe('getInstance', () => {
    it('returns the same instance for the same engine and interfaceId', () => {
      const engine = createMockEngine();
      const config = createMockConfig();

      const instance1 = GenerativeRuntime.getInstance(
        engine,
        'iface-1',
        config
      );
      const instance2 = GenerativeRuntime.getInstance(
        engine,
        'iface-1',
        config
      );

      expect(instance1).toBe(instance2);
    });

    it('returns different instances for different interfaceIds', () => {
      const engine = createMockEngine();
      const config = createMockConfig();

      const instance1 = GenerativeRuntime.getInstance(
        engine,
        'iface-1',
        config
      );
      const instance2 = GenerativeRuntime.getInstance(
        engine,
        'iface-2',
        config
      );

      expect(instance1).not.toBe(instance2);
    });

    it('returns different instances for different engines', () => {
      const engine1 = createMockEngine();
      const engine2 = createMockEngine();
      const config = createMockConfig();

      const instance1 = GenerativeRuntime.getInstance(
        engine1,
        'iface-1',
        config
      );
      const instance2 = GenerativeRuntime.getInstance(
        engine2,
        'iface-1',
        config
      );

      expect(instance1).not.toBe(instance2);
    });
  });

  describe('submit', () => {
    it('creates a turn with a generated id and streaming status', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      setupSuccessfulStream([
        {type: 'turn_complete'} as ConversationStreamEvent,
      ]);

      const runtime = GenerativeRuntime.getInstance(engine, 'test', config);
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
      setupSuccessfulStream([
        {type: 'turn_complete'} as ConversationStreamEvent,
      ]);

      const runtime = GenerativeRuntime.getInstance(
        engine,
        'submit-active',
        config
      );
      await runtime.submit('Hello');

      expect(config.statePort.setActiveTurnId).toHaveBeenCalledWith(
        'generated-id-1'
      );
    });

    it('builds the request with navigator context', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      const {mockClient} = setupSuccessfulStream([
        {type: 'turn_complete'} as ConversationStreamEvent,
      ]);

      const runtime = GenerativeRuntime.getInstance(engine, 'nav-ctx', config);
      await runtime.submit('Hello');

      expect(mockClient.call).toHaveBeenCalledWith(
        expect.objectContaining({
          clientId: 'test-client-id',
          context: expect.objectContaining({
            user: {userAgent: 'TestAgent/1.0'},
            view: {
              url: 'https://example.com',
              referrer: 'https://referrer.com',
            },
          }),
          targetEngine: 'AGENT_CORE',
        }),
        expect.anything()
      );
    });

    it('fails the turn when the API call returns an error', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      const mockClient = {
        call: vi.fn().mockResolvedValue({success: false, error: 'API error'}),
      };

      mockCreateConversationEndpointClient.mockReturnValue(mockClient);
      mockReadEndpointClientConfiguration.mockReturnValue({
        organizationId: 'test-org',
        accessToken: 'test-token',
      });

      const runtime = GenerativeRuntime.getInstance(engine, 'api-fail', config);
      await runtime.submit('Hello');

      expect(config.statePort.failTurn).toHaveBeenCalledWith(
        'generated-id-1',
        'API error'
      );
    });

    it('fails the turn when an exception is thrown', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();

      mockCreateConversationEndpointClient.mockReturnValue({
        call: vi.fn().mockRejectedValue(new Error('network failure')),
      });
      mockReadEndpointClientConfiguration.mockReturnValue({
        organizationId: 'test-org',
        accessToken: 'test-token',
      });

      const runtime = GenerativeRuntime.getInstance(
        engine,
        'exception',
        config
      );
      await runtime.submit('Hello');

      expect(config.statePort.failTurn).toHaveBeenCalledWith(
        'generated-id-1',
        'network failure'
      );
    });

    it('fails the turn with a default message for non-Error exceptions', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();

      mockCreateConversationEndpointClient.mockReturnValue({
        call: vi.fn().mockRejectedValue(42),
      });
      mockReadEndpointClientConfiguration.mockReturnValue({
        organizationId: 'test-org',
        accessToken: 'test-token',
      });

      const runtime = GenerativeRuntime.getInstance(
        engine,
        'non-error',
        config
      );
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
      setupSuccessfulStream([
        {type: 'turn_complete'} as ConversationStreamEvent,
      ]);

      const runtime = GenerativeRuntime.getInstance(engine, 'resubmit', config);
      await runtime.resubmit('existing-turn-id', 'Updated prompt');

      expect(config.statePort.clearTurnResponse).toHaveBeenCalledWith(
        'existing-turn-id'
      );
      expect(config.statePort.createTurn).toHaveBeenCalledWith({
        id: 'existing-turn-id',
        prompt: 'Updated prompt',
        status: 'streaming',
      });
    });
  });

  describe('stream consumption', () => {
    it('fails the turn when stream ends without a terminal event', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();

      const mockStream = {} as ReadableStream<Uint8Array>;
      mockCreateConversationEndpointClient.mockReturnValue({
        call: vi
          .fn()
          .mockResolvedValue({success: true, data: {stream: mockStream}}),
      });
      mockReadEndpointClientConfiguration.mockReturnValue({
        organizationId: 'test-org',
        accessToken: 'test-token',
      });
      mockReadConversationEventStream.mockImplementation(
        async ({onEvent, onDone}) => {
          onEvent({type: 'TEXT_MESSAGE_CONTENT', delta: 'hello'});
          onDone?.();
        }
      );

      const runtime = GenerativeRuntime.getInstance(
        engine,
        'no-terminal',
        config
      );
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
      mockCreateConversationEndpointClient.mockReturnValue({
        call: vi
          .fn()
          .mockResolvedValue({success: true, data: {stream: mockStream}}),
      });
      mockReadEndpointClientConfiguration.mockReturnValue({
        organizationId: 'test-org',
        accessToken: 'test-token',
      });
      mockReadConversationEventStream.mockImplementation(async ({onError}) => {
        onError?.(new Error('stream read failure'));
      });

      const runtime = GenerativeRuntime.getInstance(
        engine,
        'stream-err',
        config
      );
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
        } as ConversationStreamEvent,
        {type: 'turn_complete'} as ConversationStreamEvent,
      ]);

      const runtime = GenerativeRuntime.getInstance(
        engine,
        'turn-started',
        config
      );
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
        {
          type: 'TEXT_MESSAGE_START',
          role: 'assistant',
        } as ConversationStreamEvent,
        {type: 'turn_complete'} as ConversationStreamEvent,
      ]);

      const runtime = GenerativeRuntime.getInstance(
        engine,
        'msg-start',
        config
      );
      await runtime.submit('Hello');

      expect(config.statePort.initAgentResponse).toHaveBeenCalledWith(
        'generated-id-1'
      );
      expect(config.statePort.startMessage).toHaveBeenCalledWith(
        'generated-id-1',
        'assistant'
      );
    });

    it('handles TEXT_MESSAGE_CONTENT by appending delta', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      setupSuccessfulStream([
        {
          type: 'TEXT_MESSAGE_CONTENT',
          delta: 'Hello ',
        } as ConversationStreamEvent,
        {
          type: 'TEXT_MESSAGE_CONTENT',
          delta: 'world',
        } as ConversationStreamEvent,
        {type: 'turn_complete'} as ConversationStreamEvent,
      ]);

      const runtime = GenerativeRuntime.getInstance(
        engine,
        'msg-content',
        config
      );
      await runtime.submit('Hello');

      expect(config.statePort.appendMessageDelta).toHaveBeenCalledWith(
        'generated-id-1',
        'Hello '
      );
      expect(config.statePort.appendMessageDelta).toHaveBeenCalledWith(
        'generated-id-1',
        'world'
      );
    });

    it('handles REASONING_MESSAGE_START/CONTENT/END lifecycle', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      setupSuccessfulStream([
        {type: 'REASONING_MESSAGE_START'} as ConversationStreamEvent,
        {
          type: 'REASONING_MESSAGE_CONTENT',
          delta: 'thinking...',
        } as ConversationStreamEvent,
        {type: 'REASONING_MESSAGE_END'} as ConversationStreamEvent,
        {type: 'turn_complete'} as ConversationStreamEvent,
      ]);

      const runtime = GenerativeRuntime.getInstance(
        engine,
        'reasoning',
        config
      );
      await runtime.submit('Hello');

      expect(config.statePort.startReasoning).toHaveBeenCalledWith(
        'generated-id-1'
      );
      expect(config.statePort.appendReasoningDelta).toHaveBeenCalledWith(
        'generated-id-1',
        'thinking...'
      );
      expect(config.statePort.endReasoning).toHaveBeenCalledWith(
        'generated-id-1'
      );
    });

    it('handles TOOL_CALL_START/ARGS/END/RESULT lifecycle', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      setupSuccessfulStream([
        {
          type: 'TOOL_CALL_START',
          toolCallId: 'tc-1',
          toolCallName: 'search',
        } as ConversationStreamEvent,
        {
          type: 'TOOL_CALL_ARGS',
          toolCallId: 'tc-1',
          delta: '{"query":"test"}',
        } as ConversationStreamEvent,
        {type: 'TOOL_CALL_END', toolCallId: 'tc-1'} as ConversationStreamEvent,
        {
          type: 'TOOL_CALL_RESULT',
          toolCallId: 'tc-1',
          content: '{"results":[]}',
        } as ConversationStreamEvent,
        {type: 'turn_complete'} as ConversationStreamEvent,
      ]);

      const runtime = GenerativeRuntime.getInstance(
        engine,
        'tool-call',
        config
      );
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
        } as ConversationStreamEvent,
        {type: 'turn_complete'} as ConversationStreamEvent,
      ]);

      const runtime = GenerativeRuntime.getInstance(engine, 'activity', config);
      await runtime.submit('Hello');

      expect(config.statePort.appendSurface).toHaveBeenCalledWith(
        'generated-id-1',
        surface
      );
    });

    it('handles commerce_search_api_response by routing when hydration succeeds', async () => {
      const routedInterface = {
        useCase: 'commerceSearch' as const,
        interface: {disposed: false, dispose: vi.fn()} as InterfaceHandle,
      };
      const config = createMockConfig({
        hydrateSubInterface: vi.fn().mockReturnValue(routedInterface),
      });
      const engine = createMockEngine();

      const mockStream = {} as ReadableStream<Uint8Array>;
      mockCreateConversationEndpointClient.mockReturnValue({
        call: vi
          .fn()
          .mockResolvedValue({success: true, data: {stream: mockStream}}),
      });
      mockReadEndpointClientConfiguration.mockReturnValue({
        organizationId: 'test-org',
        accessToken: 'test-token',
      });
      mockReadConversationEventStream.mockImplementation(
        async ({onEvent, onDone}) => {
          onEvent({
            type: 'commerce_search_api_response',
            products: [],
          });
          onDone?.();
        }
      );

      const runtime = GenerativeRuntime.getInstance(
        engine,
        'commerce-route',
        config
      );
      await runtime.submit('Find shoes');

      expect(config.hydrateSubInterface).toHaveBeenCalledWith(
        'commerce_search_api_response',
        {products: []},
        'Find shoes'
      );
      expect(config.statePort.setRoutedInterface).toHaveBeenCalledWith(
        'generated-id-1',
        routedInterface
      );
    });

    it('does not set routed interface when hydration returns null', async () => {
      const config = createMockConfig({
        hydrateSubInterface: vi.fn().mockReturnValue(null),
      });
      const engine = createMockEngine();
      setupSuccessfulStream([
        {
          type: 'commerce_search_api_response',
          products: [],
        } as ConversationStreamEvent,
        {type: 'turn_complete'} as ConversationStreamEvent,
      ]);

      const runtime = GenerativeRuntime.getInstance(
        engine,
        'commerce-null',
        config
      );
      await runtime.submit('Find shoes');

      expect(config.statePort.setRoutedInterface).not.toHaveBeenCalled();
    });

    it('handles search_api_response by routing when hydration succeeds', async () => {
      const routedInterface = {
        useCase: 'search' as const,
        interface: {disposed: false, dispose: vi.fn()} as InterfaceHandle,
      };
      const config = createMockConfig({
        hydrateSubInterface: vi.fn().mockReturnValue(routedInterface),
      });
      const engine = createMockEngine();

      const mockStream = {} as ReadableStream<Uint8Array>;
      mockCreateConversationEndpointClient.mockReturnValue({
        call: vi
          .fn()
          .mockResolvedValue({success: true, data: {stream: mockStream}}),
      });
      mockReadEndpointClientConfiguration.mockReturnValue({
        organizationId: 'test-org',
        accessToken: 'test-token',
      });
      mockReadConversationEventStream.mockImplementation(
        async ({onEvent, onDone}) => {
          onEvent({
            type: 'search_api_response',
            results: [],
            totalCount: 0,
          });
          onDone?.();
        }
      );

      const runtime = GenerativeRuntime.getInstance(
        engine,
        'search-route',
        config
      );
      await runtime.submit('Find documents');

      expect(config.hydrateSubInterface).toHaveBeenCalledWith(
        'search_api_response',
        {results: [], totalCount: 0},
        'Find documents'
      );
      expect(config.statePort.setRoutedInterface).toHaveBeenCalledWith(
        'generated-id-1',
        routedInterface
      );
    });

    it('handles turn_complete by completing the turn and updating session', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      setupSuccessfulStream([
        {
          type: 'turn_complete',
          conversationSessionId: 'final-session',
          conversationToken: 'final-token',
        } as ConversationStreamEvent,
      ]);

      const runtime = GenerativeRuntime.getInstance(
        engine,
        'turn-complete',
        config
      );
      await runtime.submit('Hello');

      expect(config.statePort.setConversationSession).toHaveBeenCalledWith(
        'final-session',
        'final-token'
      );
      expect(config.statePort.completeTurn).toHaveBeenCalledWith(
        'generated-id-1'
      );
    });

    it('handles RUN_ERROR by failing the turn with the error message', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      setupSuccessfulStream([
        {
          type: 'RUN_ERROR',
          message: 'Agent encountered an error',
        } as ConversationStreamEvent,
      ]);

      const runtime = GenerativeRuntime.getInstance(
        engine,
        'run-error',
        config
      );
      await runtime.submit('Hello');

      expect(config.statePort.failTurn).toHaveBeenCalledWith(
        'generated-id-1',
        'Agent encountered an error'
      );
    });

    it('handles RUN_ERROR with empty message using default', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      setupSuccessfulStream([
        {type: 'RUN_ERROR', message: ''} as ConversationStreamEvent,
      ]);

      const runtime = GenerativeRuntime.getInstance(
        engine,
        'run-error-empty',
        config
      );
      await runtime.submit('Hello');

      expect(config.statePort.failTurn).toHaveBeenCalledWith(
        'generated-id-1',
        'An error occurred during the turn.'
      );
    });

    it('handles RUN_FINISHED by completing the turn', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      setupSuccessfulStream([
        {type: 'RUN_FINISHED'} as ConversationStreamEvent,
      ]);

      const runtime = GenerativeRuntime.getInstance(
        engine,
        'run-finished',
        config
      );
      await runtime.submit('Hello');

      expect(config.statePort.completeTurn).toHaveBeenCalledWith(
        'generated-id-1'
      );
    });

    it('ignores STATE_SNAPSHOT events', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      setupSuccessfulStream([
        {type: 'STATE_SNAPSHOT'} as ConversationStreamEvent,
        {type: 'turn_complete'} as ConversationStreamEvent,
      ]);

      const runtime = GenerativeRuntime.getInstance(
        engine,
        'state-snap',
        config
      );
      await runtime.submit('Hello');

      expect(config.statePort.completeTurn).toHaveBeenCalled();
    });

    it('ignores unknown event types', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      setupSuccessfulStream([
        {type: 'UNKNOWN_EVENT_TYPE'} as unknown as ConversationStreamEvent,
        {type: 'turn_complete'} as ConversationStreamEvent,
      ]);

      const runtime = GenerativeRuntime.getInstance(
        engine,
        'unknown-evt',
        config
      );
      await runtime.submit('Hello');

      expect(config.statePort.completeTurn).toHaveBeenCalled();
    });
  });

  describe('ensureAgentResponse idempotency', () => {
    it('calls initAgentResponse only once per turn', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      setupSuccessfulStream([
        {
          type: 'TEXT_MESSAGE_START',
          role: 'assistant',
        } as ConversationStreamEvent,
        {type: 'TEXT_MESSAGE_CONTENT', delta: 'a'} as ConversationStreamEvent,
        {type: 'REASONING_MESSAGE_START'} as ConversationStreamEvent,
        {
          type: 'TOOL_CALL_START',
          toolCallId: 'tc-1',
          toolCallName: 'x',
        } as ConversationStreamEvent,
        {type: 'turn_complete'} as ConversationStreamEvent,
      ]);

      const runtime = GenerativeRuntime.getInstance(
        engine,
        'idempotent',
        config
      );
      await runtime.submit('Hello');

      expect(config.statePort.initAgentResponse).toHaveBeenCalledTimes(1);
    });
  });

  describe('navigator context handling', () => {
    it('handles null navigator context provider', async () => {
      const config = createMockConfig();
      const engine = createMockEngine();
      (
        engine.getNavigatorContextProvider as ReturnType<typeof vi.fn>
      ).mockReturnValue(undefined);
      const {mockClient} = setupSuccessfulStream([
        {type: 'turn_complete'} as ConversationStreamEvent,
      ]);

      const runtime = GenerativeRuntime.getInstance(engine, 'no-nav', config);
      await runtime.submit('Hello');

      expect(mockClient.call).toHaveBeenCalledWith(
        expect.objectContaining({
          clientId: undefined,
          context: expect.objectContaining({
            user: {userAgent: null},
            view: {url: null, referrer: null},
          }),
        }),
        expect.anything()
      );
    });
  });
});
