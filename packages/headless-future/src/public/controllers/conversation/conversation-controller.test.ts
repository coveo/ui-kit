import {beforeEach, describe, expect, it, vi} from 'vitest';
import {createTestEngine, createTestInterface} from '@/src/test/test-utils.js';
import {
  type Engine,
  type FullEngine,
  getFullEngine,
} from '@/src/core/interface/engine/engine.js';
import {
  appendAgentChunk,
  setSession,
  startTurn,
} from '@/src/core/interface/conversation/conversation-mutators.js';
import {
  setError,
  setStatus,
  setStreamingConnected,
} from '@/src/core/interface/api/conversation-endpoint/conversation-endpoint-mutators.js';
import type {ConversationControllerSubmitTurnOptions} from './conversation-controller.js';
import {buildConversationController} from './conversation-controller.js';
import type {Requires} from '@/src/core/interface/utils/interface-types.js';

const TEST_ID = 'test';

const mockSubmitTurn =
  vi.fn<
    (
      input: string,
      options?: ConversationControllerSubmitTurnOptions
    ) => Promise<void>
  >();
const mockAbortTurn = vi.fn();

vi.mock(
  '@/src/core/interface/api/conversation-endpoint/conversation-runtime.js',
  () => ({
    ConversationRuntime: {
      getInstance: vi.fn(() => ({
        submitTurn: mockSubmitTurn,
        abortTurn: mockAbortTurn,
      })),
    },
  })
);

describe('buildConversationController', () => {
  let engine: Engine;
  let fullEngine: FullEngine;
  let conversationInterface: Requires<'conversation'>;

  const buildController = () =>
    buildConversationController({interface: conversationInterface});

  beforeEach(() => {
    vi.clearAllMocks();
    mockSubmitTurn.mockReset();
    mockAbortTurn.mockReset();
    mockSubmitTurn.mockResolvedValue();
    engine = createTestEngine();
    fullEngine = getFullEngine(engine);
    conversationInterface = createTestInterface(engine, {
      conversation: [],
    });
  });

  describe('state', () => {
    it('returns the initial composed state', () => {
      const controller = buildController();

      expect(controller.state).toEqual({
        messages: [],
        turns: [],
        activeTurnId: null,
        session: {},
        isLoading: false,
        error: null,
        streaming: {isConnected: false},
      });
    });

    it('composes conversation and endpoint state slices', () => {
      const controller = buildController();

      fullEngine.mutate(
        startTurn(
          {
            turnId: 'turn-1',
            userMessageId: 'user-1',
            agentMessageId: 'agent-1',
            input: 'hello',
            createdAt: 111,
          },
          TEST_ID
        )
      );
      fullEngine.mutate(
        appendAgentChunk(
          {
            turnId: 'turn-1',
            chunk: 'Hi there',
          },
          TEST_ID
        )
      );
      fullEngine.mutate(
        setSession(
          {
            conversationSessionId: 'conversation-1',
            conversationToken: 'token-1',
          },
          TEST_ID
        )
      );
      fullEngine.mutate(setStatus('streaming', TEST_ID));
      fullEngine.mutate(setError('endpoint error', TEST_ID));
      fullEngine.mutate(setStreamingConnected(true, TEST_ID));

      expect(controller.state).toEqual({
        messages: [
          {
            id: 'user-1',
            role: 'user',
            content: 'hello',
            createdAt: 111,
          },
          {
            id: 'agent-1',
            role: 'agent',
            content: 'Hi there',
            createdAt: 111,
          },
        ],
        turns: [
          {
            id: 'turn-1',
            status: {type: 'streaming'},
            messageIds: ['user-1', 'agent-1'],
            createdAt: 111,
          },
        ],
        activeTurnId: 'turn-1',
        session: {
          conversationSessionId: 'conversation-1',
          conversationToken: 'token-1',
        },
        isLoading: true,
        error: 'endpoint error',
        streaming: {isConnected: true},
      });
    });
  });

  describe('submitTurn()', () => {
    it('delegates to the conversation runtime', async () => {
      const controller = buildController();

      await controller.submitTurn('hello world');

      expect(mockSubmitTurn).toHaveBeenCalledWith('hello world');
      expect(mockSubmitTurn).toHaveBeenCalledTimes(1);
    });

    it('forwards continuity overrides to the conversation runtime', async () => {
      const controller = buildController();

      await controller.submitTurn('hello world', {
        conversationSessionId: 'session-1',
        conversationToken: 'token-1',
      });

      expect(mockSubmitTurn).toHaveBeenCalledWith('hello world', {
        conversationSessionId: 'session-1',
        conversationToken: 'token-1',
      });
      expect(mockSubmitTurn).toHaveBeenCalledTimes(1);
    });
  });

  describe('abortTurn()', () => {
    it('delegates to the conversation runtime', () => {
      const controller = buildController();

      controller.abortTurn();

      expect(mockAbortTurn).toHaveBeenCalledTimes(1);
    });
  });

  describe('subscribe()', () => {
    it('invokes the callback when the conversation slice changes', () => {
      const controller = buildController();
      const callback = vi.fn();

      controller.subscribe(callback);
      fullEngine.mutate(
        startTurn(
          {
            turnId: 'turn-1',
            userMessageId: 'user-1',
            agentMessageId: 'agent-1',
            input: 'hello',
            createdAt: 111,
          },
          TEST_ID
        )
      );

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('invokes the callback when the endpoint slice changes', () => {
      const controller = buildController();
      const callback = vi.fn();

      controller.subscribe(callback);
      fullEngine.mutate(setStatus('pending', TEST_ID));

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('does not invoke the callback for unrelated state changes', () => {
      const controller = buildController();
      const callback = vi.fn();

      controller.subscribe(callback);
      fullEngine.mutate({type: '@@test/unrelated'});

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
