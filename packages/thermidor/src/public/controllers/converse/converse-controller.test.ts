import {beforeEach, describe, expect, it, vi} from 'vitest';
import {createTestEngine} from '@/src/test/test-utils.js';
import {
  type Engine,
  type FullEngine,
  getFullEngine,
} from '@/src/core/interface/engine/engine.js';
import {getOrCreateGenerativeActions} from '@/src/core/internal/generative/generative-actions.js';
import {
  buildGenerativeInterface,
  type GenerativeInterface,
} from '@/src/public/interfaces/generative.js';
import {buildConverseController} from './converse-controller.js';

const TEST_ID = 'test-generative';

const mockSubmit = vi.fn<(prompt: string) => Promise<void>>();
const mockResubmit = vi.fn<(turnId: string, prompt: string) => Promise<void>>();

vi.mock(
  '@/src/core/interface/api/generative-endpoint/generative-runtime.js',
  () => ({
    GenerativeRuntime: {
      getInstance: vi.fn(() => ({
        submit: mockSubmit,
        resubmit: mockResubmit,
      })),
    },
  })
);

vi.mock('@/src/core/interface/generative/generative-hydration.js', () => ({
  createHydrateSubInterface: vi.fn(() => vi.fn()),
}));

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
    mockSubmit.mockResolvedValue();
    mockResubmit.mockResolvedValue();
    engine = createTestEngine();
    fullEngine = getFullEngine(engine);
    generativeInterface = buildGenerativeInterface({engine, id: TEST_ID});
  });

  describe('state', () => {
    it('returns the initial state', () => {
      const controller = buildController();

      expect(controller.state).toEqual({
        turns: [],
        activeTurnId: undefined,
        isStreaming: false,
      });
    });

    it('reflects turns added to the store', () => {
      const controller = buildController();
      const actions = getOrCreateGenerativeActions(TEST_ID);

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
      const actions = getOrCreateGenerativeActions(TEST_ID);

      fullEngine.mutate(
        actions.createTurn({id: 'turn-1', prompt: 'hello', status: 'streaming'})
      );

      expect(controller.state.isStreaming).toBe(true);
    });

    it('computes isStreaming as false when no turns are streaming', () => {
      const controller = buildController();
      const actions = getOrCreateGenerativeActions(TEST_ID);

      fullEngine.mutate(
        actions.createTurn({id: 'turn-1', prompt: 'hello', status: 'streaming'})
      );
      fullEngine.mutate(actions.completeTurn({turnId: 'turn-1'}));

      expect(controller.state.isStreaming).toBe(false);
    });

    it('reflects activeTurnId changes', () => {
      const controller = buildController();
      const actions = getOrCreateGenerativeActions(TEST_ID);

      fullEngine.mutate(
        actions.createTurn({id: 'turn-1', prompt: 'hello', status: 'complete'})
      );
      fullEngine.mutate(actions.setActiveTurnId('turn-1'));

      expect(controller.state.activeTurnId).toBe('turn-1');
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
      const actions = getOrCreateGenerativeActions(TEST_ID);

      fullEngine.mutate(
        actions.createTurn({id: 'turn-1', prompt: 'hi', status: 'streaming'})
      );

      controller.submit({prompt: 'new prompt'});

      expect(mockSubmit).not.toHaveBeenCalled();
    });

    it('submits when all existing turns are complete', () => {
      const controller = buildController();
      const actions = getOrCreateGenerativeActions(TEST_ID);

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
      const actions = getOrCreateGenerativeActions(TEST_ID);

      fullEngine.mutate(
        actions.createTurn({id: 'turn-1', prompt: 'hello', status: 'complete'})
      );
      fullEngine.mutate(
        actions.createTurn({id: 'turn-2', prompt: 'world', status: 'complete'})
      );

      controller.selectTurn({id: 'turn-1'});

      expect(controller.state.activeTurnId).toBe('turn-1');
    });

    it('does not modify activeTurnId when the turn does not exist', () => {
      const controller = buildController();
      const actions = getOrCreateGenerativeActions(TEST_ID);

      fullEngine.mutate(
        actions.createTurn({id: 'turn-1', prompt: 'hello', status: 'complete'})
      );
      fullEngine.mutate(actions.setActiveTurnId('turn-1'));

      controller.selectTurn({id: 'non-existent'});

      expect(controller.state.activeTurnId).toBe('turn-1');
    });
  });

  describe('retry()', () => {
    it('calls runtime.resubmit when the turn exists and has error status', () => {
      const controller = buildController();
      const actions = getOrCreateGenerativeActions(TEST_ID);

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
      const actions = getOrCreateGenerativeActions(TEST_ID);

      fullEngine.mutate(
        actions.createTurn({id: 'turn-1', prompt: 'hello', status: 'streaming'})
      );
      fullEngine.mutate(actions.completeTurn({turnId: 'turn-1'}));

      controller.retry({id: 'turn-1'});

      expect(mockResubmit).not.toHaveBeenCalled();
    });

    it('does not retry when the turn is still streaming', () => {
      const controller = buildController();
      const actions = getOrCreateGenerativeActions(TEST_ID);

      fullEngine.mutate(
        actions.createTurn({id: 'turn-1', prompt: 'hello', status: 'streaming'})
      );

      controller.retry({id: 'turn-1'});

      expect(mockResubmit).not.toHaveBeenCalled();
    });
  });

  describe('subscribe()', () => {
    it('invokes the callback when the generative state changes', () => {
      const controller = buildController();
      const callback = vi.fn();
      const actions = getOrCreateGenerativeActions(TEST_ID);

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
      const actions = getOrCreateGenerativeActions(TEST_ID);

      const unsubscribe = controller.subscribe(callback);
      unsubscribe();

      fullEngine.mutate(
        actions.createTurn({id: 'turn-1', prompt: 'hello', status: 'streaming'})
      );

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
