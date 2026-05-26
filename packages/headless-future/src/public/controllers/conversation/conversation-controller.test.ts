import {beforeEach, describe, expect, it, vi} from 'vitest';
import {createTestEngine} from '@/src/test/test-utils.js';
import {
  type Engine,
  type FullEngine,
  getFullEngine,
} from '@/src/core/interface/engine/engine.js';
import * as conversationMutators from '@/src/core/interface/conversation/conversation-mutators.js';
import * as conversationEndpointMutators from '@/src/core/interface/api/conversation-endpoint/conversation-endpoint-mutators.js';
import type {ConversationControllerSubmitTurnOptions} from './conversation-controller.js';
import {buildConversationController} from './conversation-controller.js';

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

  const buildController = () => buildConversationController({engine});

  beforeEach(() => {
    vi.clearAllMocks();
    mockSubmitTurn.mockReset();
    mockAbortTurn.mockReset();
    mockSubmitTurn.mockResolvedValue();
    engine = createTestEngine();
    fullEngine = getFullEngine(engine);
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
        conversationMutators.startTurn({
          turnId: 'turn-1',
          userMessageId: 'user-1',
          agentMessageId: 'agent-1',
          input: 'hello',
          createdAt: 111,
        })
      );
      fullEngine.mutate(
        conversationMutators.appendAgentChunk({
          turnId: 'turn-1',
          chunk: 'Hi there',
        })
      );
      fullEngine.mutate(
        conversationMutators.setSession({
          conversationSessionId: 'conversation-1',
          conversationToken: 'token-1',
        })
      );
      fullEngine.mutate(conversationEndpointMutators.setStatus('streaming'));
      fullEngine.mutate(
        conversationEndpointMutators.setError('endpoint error')
      );
      fullEngine.mutate(
        conversationEndpointMutators.setStreamingConnected(true)
      );

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
        conversationMutators.startTurn({
          turnId: 'turn-1',
          userMessageId: 'user-1',
          agentMessageId: 'agent-1',
          input: 'hello',
          createdAt: 111,
        })
      );

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('invokes the callback when the endpoint slice changes', () => {
      const controller = buildController();
      const callback = vi.fn();

      controller.subscribe(callback);
      fullEngine.mutate(conversationEndpointMutators.setStatus('pending'));

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
