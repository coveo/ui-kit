import {beforeEach, describe, expect, it, vi} from 'vitest';
import {createTestEngine} from '@/src/test/test-utils.js';
import {type Engine, type FullEngine, getFullEngine} from '@/src/internal/engine/index.js';
import {
  getOrCreateGenerativeActions,
  getOrCreateRoutedInterfaceRegistry,
} from '@/src/internal/features/generative/index.js';
import {
  buildGenerativeUnifiedInterface,
  type GenerativeUnifiedInterface,
} from '@/src/public/interfaces/generative-unified.js';
import {buildUnifiedConverseController} from './unified-converse-controller.js';
import type {SerializedConverseState} from '../converse/converse-controller-serialization.js';

const TEST_ID = 'test-unified-generative';

const mockSubmit = vi.fn<(prompt: string) => Promise<void>>();
const mockResubmit = vi.fn<(turnId: string, prompt: string) => Promise<void>>();
const mockDispatchAction = vi.fn<(action: unknown) => Promise<void>>();
const mockCancel = vi.fn<() => void>();

vi.mock('@/src/internal/api/unified/index.js', () => ({
  UnifiedRuntime: {
    getInstance: vi.fn(() => ({
      submit: mockSubmit,
      resubmit: mockResubmit,
      dispatchAction: mockDispatchAction,
      cancel: mockCancel,
    })),
  },
}));

describe('buildUnifiedConverseController', () => {
  let engine: Engine;
  let fullEngine: FullEngine;
  let generativeInterface: GenerativeUnifiedInterface;

  const buildController = (
    options?: Partial<Parameters<typeof buildUnifiedConverseController>[0]>
  ) =>
    buildUnifiedConverseController({
      interface: generativeInterface,
      ...options,
    });

  beforeEach(() => {
    vi.clearAllMocks();
    mockSubmit.mockReset();
    mockResubmit.mockReset();
    mockDispatchAction.mockReset();
    mockCancel.mockReset();
    mockSubmit.mockResolvedValue();
    mockResubmit.mockResolvedValue();
    mockDispatchAction.mockResolvedValue();
    engine = createTestEngine();
    fullEngine = getFullEngine(engine);
    generativeInterface = buildGenerativeUnifiedInterface({engine, id: TEST_ID});
  });

  describe('state', () => {
    it('returns the initial state', () => {
      const controller = buildController();

      expect(controller.state).toEqual({
        turns: [],
        activeTurn: undefined,
        isStreaming: false,
      });
    });

    it('reflects turns added to the store', () => {
      const controller = buildController();
      const actions = getOrCreateGenerativeActions(generativeInterface);

      fullEngine.mutate(actions.createTurn({id: 'turn-1', prompt: 'hello', status: 'streaming'}));

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

      fullEngine.mutate(actions.createTurn({id: 'turn-1', prompt: 'hello', status: 'streaming'}));

      expect(controller.state.isStreaming).toBe(true);
    });

    it('computes isStreaming as false when no turns are streaming', () => {
      const controller = buildController();
      const actions = getOrCreateGenerativeActions(generativeInterface);

      fullEngine.mutate(actions.createTurn({id: 'turn-1', prompt: 'hello', status: 'streaming'}));
      fullEngine.mutate(actions.completeTurn({turnId: 'turn-1'}));

      expect(controller.state.isStreaming).toBe(false);
    });

    it('reflects activeTurnId changes', () => {
      const controller = buildController();
      const actions = getOrCreateGenerativeActions(generativeInterface);

      fullEngine.mutate(actions.createTurn({id: 'turn-1', prompt: 'hello', status: 'complete'}));
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

      fullEngine.mutate(actions.createTurn({id: 'turn-1', prompt: 'hi', status: 'streaming'}));

      controller.submit({prompt: 'new prompt'});

      expect(mockSubmit).not.toHaveBeenCalled();
    });

    it('submits when all existing turns are complete', () => {
      const controller = buildController();
      const actions = getOrCreateGenerativeActions(generativeInterface);

      fullEngine.mutate(actions.createTurn({id: 'turn-1', prompt: 'hi', status: 'streaming'}));
      fullEngine.mutate(actions.completeTurn({turnId: 'turn-1'}));

      controller.submit({prompt: 'new prompt'});

      expect(mockSubmit).toHaveBeenCalledWith('new prompt');
    });
  });

  describe('dispatchAction()', () => {
    it('delegates to the runtime with the given action', () => {
      const controller = buildController();
      const action = {
        surfaceId: 'surface-1',
        name: 'selectPage',
        sourceComponentId: 'pager',
        timestamp: '2024-01-01T00:00:00.000Z',
        actionId: null,
        wantResponse: false,
        context: {page: 2},
      };

      controller.dispatchAction(action);

      expect(mockDispatchAction).toHaveBeenCalledWith(action);
      expect(mockDispatchAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('cancel()', () => {
    it('delegates to runtime.cancel()', () => {
      const controller = buildController();

      controller.cancel();

      expect(mockCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('selectTurn()', () => {
    it('sets activeTurnId when the turn exists', () => {
      const controller = buildController();
      const actions = getOrCreateGenerativeActions(generativeInterface);

      fullEngine.mutate(actions.createTurn({id: 'turn-1', prompt: 'hello', status: 'complete'}));
      fullEngine.mutate(actions.createTurn({id: 'turn-2', prompt: 'world', status: 'complete'}));

      controller.selectTurn({id: 'turn-1'});

      expect(controller.state.activeTurn?.id).toBe('turn-1');
    });

    it('does not modify activeTurnId when the turn does not exist', () => {
      const controller = buildController();
      const actions = getOrCreateGenerativeActions(generativeInterface);

      fullEngine.mutate(actions.createTurn({id: 'turn-1', prompt: 'hello', status: 'complete'}));
      fullEngine.mutate(actions.setActiveTurnId('turn-1'));

      controller.selectTurn({id: 'non-existent'});

      expect(controller.state.activeTurn?.id).toBe('turn-1');
    });
  });

  describe('retry()', () => {
    it('calls runtime.resubmit when the turn exists and has error status', () => {
      const controller = buildController();
      const actions = getOrCreateGenerativeActions(generativeInterface);

      fullEngine.mutate(actions.createTurn({id: 'turn-1', prompt: 'hello', status: 'streaming'}));
      fullEngine.mutate(actions.failTurn({turnId: 'turn-1', error: 'network failure'}));

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

      fullEngine.mutate(actions.createTurn({id: 'turn-1', prompt: 'hello', status: 'streaming'}));
      fullEngine.mutate(actions.completeTurn({turnId: 'turn-1'}));

      controller.retry({id: 'turn-1'});

      expect(mockResubmit).not.toHaveBeenCalled();
    });

    it('does not retry when the turn is still streaming', () => {
      const controller = buildController();
      const actions = getOrCreateGenerativeActions(generativeInterface);

      fullEngine.mutate(actions.createTurn({id: 'turn-1', prompt: 'hello', status: 'streaming'}));

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

      fullEngine.mutate(actions.createTurn({id: 'turn-1', prompt: 'hello', status: 'streaming'}));
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

    it('serializes routedInterface with useCase, snapshot, and query', () => {
      const controller = buildController();
      const actions = getOrCreateGenerativeActions(generativeInterface);
      const registry = getOrCreateRoutedInterfaceRegistry(generativeInterface);

      fullEngine.mutate(actions.createTurn({id: 'turn-1', prompt: 'search', status: 'streaming'}));
      registry.register('turn-1', {
        useCase: 'commerceSearch',
        interface: {} as never,
        snapshot: {results: []},
        query: 'shoes',
      });
      fullEngine.mutate(actions.setRoutedInterface({turnId: 'turn-1', useCase: 'commerceSearch'}));
      fullEngine.mutate(actions.completeTurn({turnId: 'turn-1'}));

      const result = controller.serialize();

      expect(result.turns[0].routedInterface).toEqual({
        useCase: 'commerceSearch',
        snapshot: {results: []},
        query: 'shoes',
      });
    });

    it('produces output that survives JSON round-trip', () => {
      const controller = buildController();
      const actions = getOrCreateGenerativeActions(generativeInterface);

      fullEngine.mutate(actions.createTurn({id: 'turn-1', prompt: 'hello', status: 'streaming'}));
      fullEngine.mutate(actions.initAgentResponse({turnId: 'turn-1'}));
      fullEngine.mutate(actions.startMessage({turnId: 'turn-1', role: 'assistant'}));
      fullEngine.mutate(actions.appendMessageDelta({turnId: 'turn-1', delta: 'Hi there'}));
      fullEngine.mutate(actions.completeTurn({turnId: 'turn-1'}));
      fullEngine.mutate(actions.setActiveTurnId('turn-1'));

      const serialized = controller.serialize();
      const roundTripped = JSON.parse(JSON.stringify(serialized));

      expect(roundTripped).toEqual(serialized);
    });

    it('excludes routedInterface when not set', () => {
      const controller = buildController();
      const actions = getOrCreateGenerativeActions(generativeInterface);

      fullEngine.mutate(actions.createTurn({id: 'turn-1', prompt: 'hello', status: 'streaming'}));
      fullEngine.mutate(actions.completeTurn({turnId: 'turn-1'}));

      const result = controller.serialize();

      expect(result.turns[0].routedInterface).toBeUndefined();
    });
  });

  describe('restore()', () => {
    it('hydrates state from serialized conversation', () => {
      const controller = buildController();

      controller.restore({
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
      const controller = buildController();

      controller.restore({
        name: 'hello',
        timestamp: 1000,
        turns: [{id: 'turn-1', prompt: 'hello', status: 'streaming'}],
        activeTurnId: 'turn-1',
      });

      expect(controller.state.turns[0].status).toBe('error');
      expect(controller.state.turns[0].error).toBe('Stream was interrupted');
    });
  });

  describe('clear()', () => {
    it('resets to empty state', () => {
      const controller = buildController();
      const actions = getOrCreateGenerativeActions(generativeInterface);

      fullEngine.mutate(actions.createTurn({id: 'turn-1', prompt: 'hello', status: 'streaming'}));
      fullEngine.mutate(actions.completeTurn({turnId: 'turn-1'}));
      fullEngine.mutate(actions.setActiveTurnId('turn-1'));

      controller.clear();

      expect(controller.state).toEqual({
        turns: [],
        activeTurn: undefined,
        isStreaming: false,
      });
    });
  });

  describe('conversationToRestore', () => {
    it('hydrates turns from serialized state at construction', () => {
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

      const controller = buildController({conversationToRestore});

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
        turns: [{id: 'turn-1', prompt: 'hello', status: 'streaming'}],
        activeTurnId: 'turn-1',
      };

      const controller = buildController({conversationToRestore});

      expect(controller.state.turns[0].status).toBe('error');
      expect(controller.state.turns[0].error).toBe('Stream was interrupted');
    });

    it('computes isStreaming as false after streaming turns are transitioned to error', () => {
      const conversationToRestore: SerializedConverseState = {
        name: 'hello',
        timestamp: 1000,
        turns: [{id: 'turn-1', prompt: 'hello', status: 'streaming'}],
        activeTurnId: 'turn-1',
      };

      const controller = buildController({conversationToRestore});

      expect(controller.state.isStreaming).toBe(false);
    });

    it('does not modify complete or error turns', () => {
      const conversationToRestore: SerializedConverseState = {
        name: 'hello',
        timestamp: 1000,
        turns: [
          {id: 'turn-1', prompt: 'hello', status: 'complete'},
          {id: 'turn-2', prompt: 'world', status: 'error', error: 'network failure'},
        ],
        activeTurnId: 'turn-1',
      };

      const controller = buildController({conversationToRestore});

      expect(controller.state.turns[0].status).toBe('complete');
      expect(controller.state.turns[1].status).toBe('error');
      expect(controller.state.turns[1].error).toBe('network failure');
    });
  });

  describe('state port: setRoutedInterface', () => {
    it('stores surfaceId in registry entries', async () => {
      buildController();
      const registry = getOrCreateRoutedInterfaceRegistry(generativeInterface);

      const {UnifiedRuntime} = vi.mocked(await import('@/src/internal/api/unified/index.js'));
      const getInstanceMock = UnifiedRuntime.getInstance as ReturnType<typeof vi.fn>;
      const config = getInstanceMock.mock.calls[0][2];

      config.statePort.setRoutedInterface('turn-1', {
        useCase: 'commerceSearch',
        interface: {} as never,
        snapshot: {products: []},
        query: 'shoes',
        surfaceId: 'surface-abc',
      });

      const entry = registry.get('turn-1');
      expect(entry).toBeDefined();
      expect(entry!.surfaceId).toBe('surface-abc');
      expect(entry!.useCase).toBe('commerceSearch');
      expect(entry!.snapshot).toEqual({products: []});
      expect(entry!.query).toBe('shoes');
    });

    it('clears the registry and turn when the deleted surface matches', async () => {
      const controller = buildController();
      const actions = getOrCreateGenerativeActions(generativeInterface);
      const registry = getOrCreateRoutedInterfaceRegistry(generativeInterface);
      fullEngine.mutate(actions.createTurn({id: 'turn-1', prompt: 'hello', status: 'complete'}));

      const {UnifiedRuntime} = vi.mocked(await import('@/src/internal/api/unified/index.js'));
      const getInstanceMock = UnifiedRuntime.getInstance as ReturnType<typeof vi.fn>;
      const config = getInstanceMock.mock.calls[0][2];

      config.statePort.setRoutedInterface('turn-1', {
        useCase: 'commerceSearch',
        interface: {} as never,
        snapshot: {products: []},
        query: undefined,
        surfaceId: 'surface-abc',
      });

      config.statePort.clearRoutedInterface('turn-1', 'other-surface');
      expect(registry.get('turn-1')).toBeDefined();
      expect(controller.state.turns[0].routedInterface).toBeDefined();

      config.statePort.clearRoutedInterface('turn-1', 'surface-abc');
      expect(registry.get('turn-1')).toBeUndefined();
      expect(controller.state.turns[0].routedInterface).toBeUndefined();
    });
  });

  describe('state port: appendSurface', () => {
    it('invokes onSurfaceOperation callback when messages are present', async () => {
      const onSurfaceOperation = vi.fn();
      buildController({onSurfaceOperation});

      const {UnifiedRuntime} = vi.mocked(await import('@/src/internal/api/unified/index.js'));
      const getInstanceMock = UnifiedRuntime.getInstance as ReturnType<typeof vi.fn>;
      const config = getInstanceMock.mock.calls[0][2];

      const messages = [{version: 'v1.0', createSurface: {surfaceId: 's1'}}];
      config.statePort.appendSurface('turn-1', {messages});

      expect(onSurfaceOperation).toHaveBeenCalledWith(messages);
    });

    it('does not invoke onSurfaceOperation when no messages field', async () => {
      const onSurfaceOperation = vi.fn();
      buildController({onSurfaceOperation});

      const {UnifiedRuntime} = vi.mocked(await import('@/src/internal/api/unified/index.js'));
      const getInstanceMock = UnifiedRuntime.getInstance as ReturnType<typeof vi.fn>;
      const config = getInstanceMock.mock.calls[0][2];

      config.statePort.appendSurface('turn-1', {data: 'something'});

      expect(onSurfaceOperation).not.toHaveBeenCalled();
    });
  });

  describe('subscribe()', () => {
    it('invokes the callback when the generative state changes', () => {
      const controller = buildController();
      const callback = vi.fn();
      const actions = getOrCreateGenerativeActions(generativeInterface);

      controller.subscribe(callback);
      fullEngine.mutate(actions.createTurn({id: 'turn-1', prompt: 'hello', status: 'streaming'}));

      expect(callback).toHaveBeenCalled();
    });

    it('returns an unsubscribe function that stops notifications', () => {
      const controller = buildController();
      const callback = vi.fn();
      const actions = getOrCreateGenerativeActions(generativeInterface);

      const unsubscribe = controller.subscribe(callback);
      unsubscribe();

      fullEngine.mutate(actions.createTurn({id: 'turn-1', prompt: 'hello', status: 'streaming'}));

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
