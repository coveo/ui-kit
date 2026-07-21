import {beforeEach, describe, expect, it, vi} from 'vitest';
import {createTestEngine} from '@/src/test/test-utils.js';
import {
  type Engine,
  type FullEngine,
  getFullEngine,
} from '@/src/internal/engine/index.js';
import {getOrCreateGenerativeActions} from '@/src/internal/features/generative/index.js';
import {
  buildGenerativeInterface,
  type GenerativeInterface,
} from '@/src/public/interfaces/generative.js';
import {buildConverseController} from './converse-controller.js';
import type {SerializedConverseState} from './converse-controller-serialization.js';

const TEST_ID = 'test-generative';

const mockSubmit = vi.fn<(prompt: string) => Promise<void>>();
const mockResubmit = vi.fn<(turnId: string, prompt: string) => Promise<void>>();
const mockSetConversationSession =
  vi.fn<(sessionId: string | undefined, token: string | undefined) => void>();
const mockGetConversationSessionId = vi.fn<() => string | undefined>();
const mockGetConversationToken = vi.fn<() => string | undefined>();

vi.mock('@/src/internal/api/generative/index.js', () => ({
  GenerativeRuntime: {
    getInstance: vi.fn(() => ({
      submit: mockSubmit,
      resubmit: mockResubmit,
      setConversationSession: mockSetConversationSession,
      getConversationSessionId: mockGetConversationSessionId,
      getConversationToken: mockGetConversationToken,
    })),
  },
}));

vi.mock(
  '@/src/internal/features/generative/index.js',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('@/src/internal/features/generative/index.js')
      >();
    return {
      ...actual,
      createHydrateSubInterface: vi.fn(() => vi.fn()),
    };
  }
);

describe('buildConverseController', () => {
  let engine: Engine;
  let fullEngine: FullEngine;
  let generativeInterface: GenerativeInterface;

  const buildController = () =>
    buildConverseController({interface: generativeInterface});

  beforeEach(() => {
    vi.clearAllMocks();
    mockSubmit.mockReset();
    mockResubmit.mockReset();
    mockSetConversationSession.mockReset();
    mockGetConversationSessionId.mockReset();
    mockGetConversationToken.mockReset();
    mockSubmit.mockResolvedValue();
    mockResubmit.mockResolvedValue();
    mockGetConversationSessionId.mockReturnValue(undefined);
    mockGetConversationToken.mockReturnValue(undefined);
    engine = createTestEngine();
    fullEngine = getFullEngine(engine);
    generativeInterface = buildGenerativeInterface({engine, id: TEST_ID});
  });

  describe('state', () => {
    it('returns the initial state', () => {
      const controller = buildController();

      expect(controller.state).toEqual({
        turns: [],
        isStreaming: false,
      });
    });

    it('reflects turns added to the store', () => {
      const controller = buildController();
      const actions = getOrCreateGenerativeActions(generativeInterface);

      fullEngine.mutate(
        actions.createTurn({id: 'turn-1', prompt: 'hello', status: 'streaming'})
      );

      expect(controller.state.turns).toHaveLength(1);
      expect(controller.state.turns[0]).toMatchObject({
        id: 'turn-1',
        prompt: 'hello',
        status: 'streaming',
      });
    });

    it('computes isStreaming as true when any turn is streaming', () => {
      const controller = buildController();
      const actions = getOrCreateGenerativeActions(generativeInterface);

      fullEngine.mutate(
        actions.createTurn({id: 'turn-1', prompt: 'hello', status: 'streaming'})
      );

      expect(controller.state.isStreaming).toBe(true);
    });

    it('computes isStreaming as false when no turns are streaming', () => {
      const controller = buildController();
      const actions = getOrCreateGenerativeActions(generativeInterface);

      fullEngine.mutate(
        actions.createTurn({id: 'turn-1', prompt: 'hello', status: 'streaming'})
      );
      fullEngine.mutate(actions.completeTurn({turnId: 'turn-1'}));

      expect(controller.state.isStreaming).toBe(false);
    });

    it('reflects activeTurnId changes', () => {
      const controller = buildController();
      const actions = getOrCreateGenerativeActions(generativeInterface);

      fullEngine.mutate(
        actions.createTurn({id: 'turn-1', prompt: 'hello', status: 'complete'})
      );
      fullEngine.mutate(actions.setActiveTurnId('turn-1'));

      expect(controller.state.activeTurn?.id).toBe('turn-1');
    });
  });

  describe('submit()', () => {
    it('delegates to the runtime when prompt is valid', () => {
      const controller = buildController();

      controller.submit({prompt: 'hello world'});

      expect(mockSubmit).toHaveBeenCalledWith('hello world');
      expect(mockSubmit).toHaveBeenCalledTimes(1);
    });

    it('does not submit when prompt is empty', () => {
      const controller = buildController();

      controller.submit({prompt: ''});

      expect(mockSubmit).not.toHaveBeenCalled();
    });

    it('does not submit when prompt is only whitespace', () => {
      const controller = buildController();

      controller.submit({prompt: '   '});

      expect(mockSubmit).not.toHaveBeenCalled();
    });

    it('does not submit when a turn is currently streaming', () => {
      const controller = buildController();
      const actions = getOrCreateGenerativeActions(generativeInterface);

      fullEngine.mutate(
        actions.createTurn({id: 'turn-1', prompt: 'hi', status: 'streaming'})
      );

      controller.submit({prompt: 'new prompt'});

      expect(mockSubmit).not.toHaveBeenCalled();
    });

    it('submits when all existing turns are complete', () => {
      const controller = buildController();
      const actions = getOrCreateGenerativeActions(generativeInterface);

      fullEngine.mutate(
        actions.createTurn({id: 'turn-1', prompt: 'hi', status: 'streaming'})
      );
      fullEngine.mutate(actions.completeTurn({turnId: 'turn-1'}));

      controller.submit({prompt: 'new prompt'});

      expect(mockSubmit).toHaveBeenCalledWith('new prompt');
    });
  });

  describe('selectTurn()', () => {
    it('sets activeTurnId when the turn exists', () => {
      const controller = buildController();
      const actions = getOrCreateGenerativeActions(generativeInterface);

      fullEngine.mutate(
        actions.createTurn({id: 'turn-1', prompt: 'hello', status: 'complete'})
      );
      fullEngine.mutate(
        actions.createTurn({id: 'turn-2', prompt: 'world', status: 'complete'})
      );

      controller.selectTurn({id: 'turn-1'});

      expect(controller.state.activeTurn?.id).toBe('turn-1');
    });

    it('does not modify activeTurnId when the turn does not exist', () => {
      const controller = buildController();
      const actions = getOrCreateGenerativeActions(generativeInterface);

      fullEngine.mutate(
        actions.createTurn({id: 'turn-1', prompt: 'hello', status: 'complete'})
      );
      fullEngine.mutate(actions.setActiveTurnId('turn-1'));

      controller.selectTurn({id: 'non-existent'});

      expect(controller.state.activeTurn?.id).toBe('turn-1');
    });
  });

  describe('retry()', () => {
    it('calls runtime.resubmit when the turn exists and has error status', () => {
      const controller = buildController();
      const actions = getOrCreateGenerativeActions(generativeInterface);

      fullEngine.mutate(
        actions.createTurn({id: 'turn-1', prompt: 'hello', status: 'streaming'})
      );
      fullEngine.mutate(
        actions.failTurn({turnId: 'turn-1', error: 'network failure'})
      );

      controller.retry({id: 'turn-1'});

      expect(mockResubmit).toHaveBeenCalledWith('turn-1', 'hello');
    });

    it('does not retry when the turn does not exist', () => {
      const controller = buildController();

      controller.retry({id: 'non-existent'});

      expect(mockResubmit).not.toHaveBeenCalled();
    });

    it('does not retry when the turn is not in error status', () => {
      const controller = buildController();
      const actions = getOrCreateGenerativeActions(generativeInterface);

      fullEngine.mutate(
        actions.createTurn({id: 'turn-1', prompt: 'hello', status: 'streaming'})
      );
      fullEngine.mutate(actions.completeTurn({turnId: 'turn-1'}));

      controller.retry({id: 'turn-1'});

      expect(mockResubmit).not.toHaveBeenCalled();
    });

    it('does not retry when the turn is still streaming', () => {
      const controller = buildController();
      const actions = getOrCreateGenerativeActions(generativeInterface);

      fullEngine.mutate(
        actions.createTurn({id: 'turn-1', prompt: 'hello', status: 'streaming'})
      );

      controller.retry({id: 'turn-1'});

      expect(mockResubmit).not.toHaveBeenCalled();
    });
  });

  describe('serialize()', () => {
    it('returns empty state when no turns exist', () => {
      const controller = buildController();

      const result = controller.serialize();

      expect(result).toMatchObject({
        turns: [],
        activeTurnId: undefined,
        name: '',
        conversationSessionId: undefined,
        conversationToken: undefined,
      });
      expect(result.timestamp).toEqual(expect.any(Number));
    });

    it('serializes turns with their data', () => {
      const controller = buildController();
      const actions = getOrCreateGenerativeActions(generativeInterface);

      fullEngine.mutate(
        actions.createTurn({id: 'turn-1', prompt: 'hello', status: 'streaming'})
      );
      fullEngine.mutate(actions.completeTurn({turnId: 'turn-1'}));
      fullEngine.mutate(actions.setActiveTurnId('turn-1'));

      const result = controller.serialize();

      expect(result.turns).toHaveLength(1);
      expect(result.turns[0]).toMatchObject({
        id: 'turn-1',
        prompt: 'hello',
        status: 'complete',
      });
      expect(result.activeTurnId).toBe('turn-1');
    });

    it('reduces routedInterface to {useCase} only', () => {
      const controller = buildController();
      const actions = getOrCreateGenerativeActions(generativeInterface);

      fullEngine.mutate(
        actions.createTurn({
          id: 'turn-1',
          prompt: 'search',
          status: 'streaming',
        })
      );
      fullEngine.mutate(
        actions.setRoutedInterface({
          turnId: 'turn-1',
          routedInterface: {
            useCase: 'commerceSearch',
            interface: {} as never,
          },
        })
      );
      fullEngine.mutate(actions.completeTurn({turnId: 'turn-1'}));

      const result = controller.serialize();

      expect(result.turns[0].routedInterface).toEqual({
        useCase: 'commerceSearch',
      });
    });

    it('produces output that survives JSON round-trip', () => {
      const controller = buildController();
      const actions = getOrCreateGenerativeActions(generativeInterface);

      fullEngine.mutate(
        actions.createTurn({id: 'turn-1', prompt: 'hello', status: 'streaming'})
      );
      fullEngine.mutate(actions.initAgentResponse({turnId: 'turn-1'}));
      fullEngine.mutate(
        actions.startMessage({turnId: 'turn-1', role: 'assistant'})
      );
      fullEngine.mutate(
        actions.appendMessageDelta({turnId: 'turn-1', delta: 'Hi there'})
      );
      fullEngine.mutate(actions.completeTurn({turnId: 'turn-1'}));
      fullEngine.mutate(actions.setActiveTurnId('turn-1'));

      const serialized = controller.serialize();
      const roundTripped = JSON.parse(JSON.stringify(serialized));

      expect(roundTripped).toEqual(serialized);
    });

    it('excludes routedInterface when not set', () => {
      const controller = buildController();
      const actions = getOrCreateGenerativeActions(generativeInterface);

      fullEngine.mutate(
        actions.createTurn({id: 'turn-1', prompt: 'hello', status: 'streaming'})
      );
      fullEngine.mutate(actions.completeTurn({turnId: 'turn-1'}));

      const result = controller.serialize();

      expect(result.turns[0].routedInterface).toBeUndefined();
    });
  });

  describe('subscribe()', () => {
    it('invokes the callback when the generative state changes', () => {
      const controller = buildController();
      const callback = vi.fn();
      const actions = getOrCreateGenerativeActions(generativeInterface);

      controller.subscribe(callback);
      fullEngine.mutate(
        actions.createTurn({id: 'turn-1', prompt: 'hello', status: 'streaming'})
      );

      expect(callback).toHaveBeenCalled();
    });

    it('does not invoke the callback for unrelated state changes', () => {
      const controller = buildController();
      const callback = vi.fn();

      controller.subscribe(callback);
      fullEngine.mutate({type: '@@test/unrelated'});

      expect(callback).not.toHaveBeenCalled();
    });

    it('returns an unsubscribe function that stops notifications', () => {
      const controller = buildController();
      const callback = vi.fn();
      const actions = getOrCreateGenerativeActions(generativeInterface);

      const unsubscribe = controller.subscribe(callback);
      unsubscribe();

      fullEngine.mutate(
        actions.createTurn({id: 'turn-1', prompt: 'hello', status: 'streaming'})
      );

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('conversationToRestore', () => {
    it('hydrates turns from serialized state', () => {
      const conversationToRestore: SerializedConverseState = {
        name: 'hello',
        timestamp: 1000,
        conversationSessionId: 'session-1',
        conversationToken: 'token-1',
        turns: [
          {
            id: 'turn-1',
            prompt: 'hello',
            status: 'complete',
            agentResponse: {
              messages: [{content: 'Hi there', role: 'assistant'}],
              surfaces: [],
              reasoningSteps: [],
            },
          },
        ],
        activeTurnId: 'turn-1',
      };

      const controller = buildConverseController({
        interface: generativeInterface,
        conversationToRestore,
      });

      expect(controller.state.turns).toHaveLength(1);
      expect(controller.state.turns[0]).toMatchObject({
        id: 'turn-1',
        prompt: 'hello',
        status: 'complete',
      });
      expect(controller.state.activeTurn?.id).toBe('turn-1');
    });

    it('transitions streaming turns to error status', () => {
      const conversationToRestore: SerializedConverseState = {
        name: 'hello',
        timestamp: 1000,
        turns: [
          {
            id: 'turn-1',
            prompt: 'hello',
            status: 'streaming',
          },
        ],
        activeTurnId: 'turn-1',
      };

      const controller = buildConverseController({
        interface: generativeInterface,
        conversationToRestore,
      });

      expect(controller.state.turns[0].status).toBe('error');
      expect(controller.state.turns[0].error).toBe('Stream was interrupted');
    });

    it('does not modify complete or error turns', () => {
      const conversationToRestore: SerializedConverseState = {
        name: 'hello',
        timestamp: 1000,
        turns: [
          {
            id: 'turn-1',
            prompt: 'hello',
            status: 'complete',
          },
          {
            id: 'turn-2',
            prompt: 'world',
            status: 'error',
            error: 'network failure',
          },
        ],
        activeTurnId: 'turn-1',
      };

      const controller = buildConverseController({
        interface: generativeInterface,
        conversationToRestore,
      });

      expect(controller.state.turns[0].status).toBe('complete');
      expect(controller.state.turns[1].status).toBe('error');
      expect(controller.state.turns[1].error).toBe('network failure');
    });

    it('sets activeTurnId from serialized state', () => {
      const conversationToRestore: SerializedConverseState = {
        name: 'hello',
        timestamp: 1000,
        turns: [
          {
            id: 'turn-1',
            prompt: 'hello',
            status: 'complete',
          },
          {
            id: 'turn-2',
            prompt: 'world',
            status: 'complete',
          },
        ],
        activeTurnId: 'turn-2',
      };

      const controller = buildConverseController({
        interface: generativeInterface,
        conversationToRestore,
      });

      expect(controller.state.activeTurn?.id).toBe('turn-2');
    });

    it('first state read contains hydrated turns', () => {
      const conversationToRestore: SerializedConverseState = {
        name: 'hello',
        timestamp: 1000,
        turns: [
          {
            id: 'turn-1',
            prompt: 'hello',
            status: 'complete',
          },
        ],
        activeTurnId: 'turn-1',
      };

      const controller = buildConverseController({
        interface: generativeInterface,
        conversationToRestore,
      });

      expect(controller.state.turns).toHaveLength(1);
      expect(controller.state.activeTurn?.id).toBe('turn-1');
      expect(controller.state.activeTurn).toMatchObject({
        id: 'turn-1',
        prompt: 'hello',
      });
    });

    it('computes isStreaming as false after streaming turns are transitioned to error', () => {
      const conversationToRestore: SerializedConverseState = {
        name: 'hello',
        timestamp: 1000,
        turns: [
          {
            id: 'turn-1',
            prompt: 'hello',
            status: 'streaming',
          },
        ],
        activeTurnId: 'turn-1',
      };

      const controller = buildConverseController({
        interface: generativeInterface,
        conversationToRestore,
      });

      expect(controller.state.isStreaming).toBe(false);
    });

    it('works without conversationToRestore', () => {
      const controller = buildController();

      expect(controller.state).toEqual({
        turns: [],
        activeTurn: undefined,
        isStreaming: false,
      });
    });
  });
});
