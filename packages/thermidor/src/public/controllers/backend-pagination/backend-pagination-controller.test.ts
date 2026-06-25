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
import {getOrCreateBackendInterfacesActions} from '@/src/core/internal/backend-interfaces/backend-interfaces-actions.js';
import {getOrCreateBackendInterfacesSlice} from '@/src/core/internal/backend-interfaces/backend-interfaces-slice.js';
import type {GenerativeInterface} from '@/src/public/interfaces/generative.js';
import type {ConverseController} from '../converse/converse-controller.js';
import {buildBackendPaginationController} from './backend-pagination-controller.js';

const TEST_ID = 'test-gen';

function createTestGenerativeInterface(engine: Engine): GenerativeInterface {
  const fullEngine = getFullEngine(engine);
  fullEngine.adoptSlice(getOrCreateBackendInterfacesSlice(TEST_ID));
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

describe('buildBackendPaginationController', () => {
  let engine: Engine;
  let generativeInterface: GenerativeInterface;
  let converseController: ConverseController;

  beforeEach(() => {
    engine = createTestEngine();
    generativeInterface = createTestGenerativeInterface(engine);
    converseController = createMockConverseController();
  });

  it('returns default pagination when interface does not exist', () => {
    const controller = buildBackendPaginationController({
      interface: generativeInterface,
      converseController,
      interfaceId: 'ui-1',
    });

    expect(controller.state).toEqual({
      page: 0,
      pageSize: 0,
      totalCount: 0,
      totalPages: 0,
    });
  });

  it('reads pagination from backend interface state', () => {
    const fullEngine = getFullEngine(engine);
    const actions = getOrCreateBackendInterfacesActions(TEST_ID);

    fullEngine.mutate(
      actions.createInterface({
        interfaceId: 'ui-1',
        type: 'product_search',
        display: 'main',
        state: {
          pagination: {page: 2, pageSize: 20, totalEntries: 100, totalPages: 5},
        },
      })
    );

    const controller = buildBackendPaginationController({
      interface: generativeInterface,
      converseController,
      interfaceId: 'ui-1',
    });

    expect(controller.state).toEqual({
      page: 2,
      pageSize: 20,
      totalCount: 100,
      totalPages: 5,
    });
  });

  it('selectPage sends select_page action', () => {
    const controller = buildBackendPaginationController({
      interface: generativeInterface,
      converseController,
      interfaceId: 'ui-1',
    });

    controller.selectPage(3);

    expect(converseController.sendAction).toHaveBeenCalledWith({
      type: 'select_page',
      interfaceId: 'ui-1',
      page: 3,
    });
  });

  it('setPageSize sends set_page_size action', () => {
    const controller = buildBackendPaginationController({
      interface: generativeInterface,
      converseController,
      interfaceId: 'ui-1',
    });

    controller.setPageSize(50);

    expect(converseController.sendAction).toHaveBeenCalledWith({
      type: 'set_page_size',
      interfaceId: 'ui-1',
      pageSize: 50,
    });
  });
});
