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
import {buildBackendSortController} from './backend-sort-controller.js';

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

describe('buildBackendSortController', () => {
  let engine: Engine;
  let generativeInterface: GenerativeInterface;
  let converseController: ConverseController;

  beforeEach(() => {
    engine = createTestEngine();
    generativeInterface = createTestGenerativeInterface(engine);
    converseController = createMockConverseController();
  });

  it('returns empty state when interface does not exist', () => {
    const controller = buildBackendSortController({
      interface: generativeInterface,
      converseController,
      interfaceId: 'ui-1',
    });

    expect(controller.state).toEqual({
      appliedSort: undefined,
      availableSorts: [],
    });
  });

  it('reads sort state from backend interface', () => {
    const fullEngine = getFullEngine(engine);
    const actions = getOrCreateBackendInterfacesActions(TEST_ID);

    fullEngine.mutate(
      actions.createInterface({
        interfaceId: 'ui-1',
        type: 'product_search',
        display: 'main',
        state: {
          sort: {
            appliedSort: {sortCriteria: 'relevance'},
            availableSorts: [
              {sortCriteria: 'relevance'},
              {
                sortCriteria: 'fields',
                fields: [{field: 'ec_price', direction: 'asc'}],
              },
              {
                sortCriteria: 'fields',
                fields: [{field: 'ec_price', direction: 'desc'}],
              },
            ],
          },
        },
      })
    );

    const controller = buildBackendSortController({
      interface: generativeInterface,
      converseController,
      interfaceId: 'ui-1',
    });

    expect(controller.state).toEqual({
      appliedSort: {sortCriteria: 'relevance'},
      availableSorts: [
        {sortCriteria: 'relevance'},
        {
          sortCriteria: 'fields',
          fields: [{field: 'ec_price', direction: 'asc'}],
        },
        {
          sortCriteria: 'fields',
          fields: [{field: 'ec_price', direction: 'desc'}],
        },
      ],
    });
  });

  it('sortBy sends set_sort action without fields for relevance', () => {
    const controller = buildBackendSortController({
      interface: generativeInterface,
      converseController,
      interfaceId: 'ui-1',
    });

    controller.sortBy({sortCriteria: 'relevance'});

    expect(converseController.sendAction).toHaveBeenCalledWith({
      type: 'set_sort',
      interfaceId: 'ui-1',
      sortCriteria: 'relevance',
      fields: undefined,
    });
  });

  it('sortBy sends set_sort action with fields for field-based sort', () => {
    const controller = buildBackendSortController({
      interface: generativeInterface,
      converseController,
      interfaceId: 'ui-1',
    });

    controller.sortBy({
      sortCriteria: 'fields',
      fields: [{field: 'ec_price', direction: 'asc'}],
    });

    expect(converseController.sendAction).toHaveBeenCalledWith({
      type: 'set_sort',
      interfaceId: 'ui-1',
      sortCriteria: 'fields',
      fields: [{field: 'ec_price', direction: 'asc'}],
    });
  });
});
