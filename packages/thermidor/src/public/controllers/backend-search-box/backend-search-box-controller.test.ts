import {beforeEach, describe, expect, it, vi} from 'vitest';
import {createTestEngine} from '@/src/test/test-utils.js';
import {
  type Engine,
  getFullEngine,
} from '@/src/core/interface/engine/engine.js';
import {
  ENGINE,
  STATE_ID,
  SOURCE_ENGINE,
  KIND,
  TYPE,
  FACADE_RESOLVERS,
} from '@/src/core/interface/utils/symbols.js';
import {getOrCreateBackendSurfacesActions} from '@/src/core/internal/backend-surfaces/backend-surfaces-actions.js';
import {getOrCreateBackendSurfacesSlice} from '@/src/core/internal/backend-surfaces/backend-surfaces-slice.js';
import type {GenerativeInterface} from '@/src/public/interfaces/generative.js';
import type {ConverseController} from '../converse/converse-controller.js';
import {buildBackendSearchBoxController} from './backend-search-box-controller.js';

const TEST_ID = 'test-gen';

function createTestGenerativeInterface(engine: Engine): GenerativeInterface {
  const fullEngine = getFullEngine(engine);
  fullEngine.adoptSlice(getOrCreateBackendSurfacesSlice(TEST_ID));
  return Object.freeze({
    [KIND]: 'interface' as const,
    [TYPE]: 'generative' as const,
    [STATE_ID]: TEST_ID,
    [ENGINE]: fullEngine,
    [SOURCE_ENGINE]: engine,
    [FACADE_RESOLVERS]: {conversation: () => ({}) as any},
  }) as unknown as GenerativeInterface;
}

function createMockConverseController(): ConverseController {
  return {
    submit: vi.fn(),
    sendAction: vi.fn(),
    selectTurn: vi.fn(),
    retry: vi.fn(),
    state: {
      turns: [],
      activeTurnId: undefined,
      activeTurn: undefined,
      isStreaming: false,
    },
    subscribe: vi.fn(() => () => {}),
  };
}

describe('buildBackendSearchBoxController', () => {
  let engine: Engine;
  let generativeInterface: GenerativeInterface;
  let converseController: ConverseController;

  beforeEach(() => {
    engine = createTestEngine();
    generativeInterface = createTestGenerativeInterface(engine);
    converseController = createMockConverseController();
  });

  it('returns empty query when interface does not exist', () => {
    const controller = buildBackendSearchBoxController({
      interface: generativeInterface,
      converseController,
      surfaceId: 'ui-1',
    });

    expect(controller.state.query).toBe('');
  });

  it('reads query from backend interface state', () => {
    const fullEngine = getFullEngine(engine);
    const actions = getOrCreateBackendSurfacesActions(TEST_ID);

    fullEngine.mutate(
      actions.createSurface({
        surfaceId: 'ui-1',
        type: 'product_search',
        display: 'main',
        state: {query: 'red shirt'},
      })
    );

    const controller = buildBackendSearchBoxController({
      interface: generativeInterface,
      converseController,
      surfaceId: 'ui-1',
    });

    expect(controller.state.query).toBe('red shirt');
  });

  it('submit sends execute_search action with current query', () => {
    const fullEngine = getFullEngine(engine);
    const actions = getOrCreateBackendSurfacesActions(TEST_ID);

    fullEngine.mutate(
      actions.createSurface({
        surfaceId: 'ui-1',
        type: 'product_search',
        display: 'main',
        state: {query: 'blue hat'},
      })
    );

    const controller = buildBackendSearchBoxController({
      interface: generativeInterface,
      converseController,
      surfaceId: 'ui-1',
    });

    controller.submit();

    expect(converseController.sendAction).toHaveBeenCalledWith({
      type: 'execute_search',
      query: 'blue hat',
    });
  });
});
