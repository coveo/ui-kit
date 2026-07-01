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
import {getOrCreateGenerativeActions} from '@/src/core/internal/generative/generative-actions.js';
import {getOrCreateGenerativeSlice} from '@/src/core/internal/generative/generative-slice.js';
import type {GenerativeInterface} from '@/src/public/interfaces/generative.js';
import type {ConverseController} from '../converse/converse-controller.js';
import {
  buildBackendUrlManagerController,
  serializeInterfaceState,
  deserializeFragment,
} from './backend-url-manager-controller.js';

const TEST_ID = 'test-gen';

function createTestGenerativeInterface(engine: Engine): GenerativeInterface {
  const fullEngine = getFullEngine(engine);
  fullEngine.adoptSlice(getOrCreateBackendInterfacesSlice(TEST_ID));
  fullEngine.adoptSlice(getOrCreateGenerativeSlice(TEST_ID));
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
    restoreSession: vi.fn(),
    state: {
      turns: [],
      activeTurnId: undefined,
      activeTurn: undefined,
      isStreaming: false,
      conversationSessionId: undefined,
    },
    subscribe: vi.fn(() => () => {}),
  };
}

describe('serializeInterfaceState', () => {
  it('serializes a full state', () => {
    const result = serializeInterfaceState('session-1', 'ui-1', {
      query: 'red shirt',
      facets: [
        {
          facetId: 'brand',
          field: 'ec_brand',
          values: [
            {value: 'Nike', state: 'selected', numberOfResults: 42},
            {value: 'Adidas', state: 'idle', numberOfResults: 30},
          ],
        },
      ],
      pagination: {page: 2, pageSize: 20, totalEntries: 100, totalPages: 5},
      sort: {
        appliedSort: {
          sortCriteria: 'fields',
          fields: [{field: 'ec_price', direction: 'asc'}],
        },
      },
    });

    const params = new URLSearchParams(result);
    expect(params.get('csid')).toBe('session-1');
    expect(params.get('iid')).toBe('ui-1');
    expect(params.get('q')).toBe('red shirt');
    expect(params.get('f-ec_brand')).toBe('Nike');
    expect(params.get('page')).toBe('2');
    expect(params.get('sort')).toBe('ec_price:asc');
  });

  it('omits page 0 and empty facets', () => {
    const result = serializeInterfaceState('s1', 'ui-1', {
      query: 'shoes',
      facets: [
        {
          facetId: 'brand',
          field: 'ec_brand',
          values: [{value: 'Nike', state: 'idle', numberOfResults: 5}],
        },
      ],
      pagination: {page: 0, pageSize: 20},
      sort: {appliedSort: {sortCriteria: 'relevance'}},
    });

    const params = new URLSearchParams(result);
    expect(params.get('q')).toBe('shoes');
    expect(params.has('page')).toBe(false);
    expect(params.has('f-ec_brand')).toBe(false);
    expect(params.get('sort')).toBe('relevance');
  });
});

describe('deserializeFragment', () => {
  it('parses a full fragment', () => {
    const result = deserializeFragment(
      'csid=session-1&iid=ui-1&q=red+shirt&f-ec_brand=Nike%2CAdidas&page=2&sort=ec_price%3Aasc'
    );

    expect(result.csid).toBe('session-1');
    expect(result.interfaceId).toBe('ui-1');
    expect(result.query).toBe('red shirt');
    expect(result.page).toBe(2);
    expect(result.sort).toEqual({
      sortCriteria: 'fields',
      fields: [{field: 'ec_price', direction: 'asc'}],
    });
    expect(result.facets).toEqual([
      {facetId: 'ec_brand', field: 'ec_brand', values: ['Nike', 'Adidas']},
    ]);
  });

  it('parses relevance sort', () => {
    const result = deserializeFragment('sort=relevance');
    expect(result.sort).toEqual({sortCriteria: 'relevance'});
  });

  it('returns empty object for empty fragment', () => {
    const result = deserializeFragment('');
    expect(result).toEqual({});
  });
});

describe('buildBackendUrlManagerController', () => {
  let engine: Engine;
  let generativeInterface: GenerativeInterface;
  let converseController: ConverseController;

  beforeEach(() => {
    engine = createTestEngine();
    generativeInterface = createTestGenerativeInterface(engine);
    converseController = createMockConverseController();
  });

  it('returns empty fragment when interface does not exist', () => {
    const controller = buildBackendUrlManagerController({
      interface: generativeInterface,
      converseController,
      interfaceId: 'ui-1',
    });

    expect(controller.state.fragment).toBe('');
  });

  it('returns serialized fragment when interface exists', () => {
    const fullEngine = getFullEngine(engine);
    const biActions = getOrCreateBackendInterfacesActions(TEST_ID);
    const genActions = getOrCreateGenerativeActions(TEST_ID);

    fullEngine.mutate(genActions.setConversationSessionId('sess-123'));
    fullEngine.mutate(
      biActions.createInterface({
        interfaceId: 'ui-1',
        type: 'product_search',
        display: 'main',
        state: {
          query: 'shoes',
          products: [],
          facets: [],
          pagination: {page: 0, pageSize: 20, totalEntries: 50, totalPages: 3},
          sort: {appliedSort: {sortCriteria: 'relevance'}, availableSorts: []},
          responseId: 'r1',
        },
      })
    );

    const controller = buildBackendUrlManagerController({
      interface: generativeInterface,
      converseController,
      interfaceId: 'ui-1',
    });

    const params = new URLSearchParams(controller.state.fragment);
    expect(params.get('csid')).toBe('sess-123');
    expect(params.get('iid')).toBe('ui-1');
    expect(params.get('q')).toBe('shoes');
    expect(params.get('sort')).toBe('relevance');
  });

  it('synchronize sends restore_state action', () => {
    const controller = buildBackendUrlManagerController({
      interface: generativeInterface,
      converseController,
      interfaceId: 'ui-1',
    });

    controller.synchronize('q=red+shirt&page=1&sort=relevance');

    expect(converseController.sendAction).toHaveBeenCalledWith({
      type: 'restore_state',
      interfaceId: 'ui-1',
      query: 'red shirt',
      facets: undefined,
      page: 1,
      sort: {sortCriteria: 'relevance'},
    });
  });

  it('synchronize with facets sends correct restore_state', () => {
    const controller = buildBackendUrlManagerController({
      interface: generativeInterface,
      converseController,
      interfaceId: 'ui-1',
    });

    controller.synchronize(
      'q=shirt&f-ec_brand=Nike,Adidas&page=0&sort=relevance'
    );

    expect(converseController.sendAction).toHaveBeenCalledWith({
      type: 'restore_state',
      interfaceId: 'ui-1',
      query: 'shirt',
      facets: [{facetId: 'ec_brand', values: ['Nike', 'Adidas']}],
      page: 0,
      sort: {sortCriteria: 'relevance'},
    });
  });

  it('subscriber fires when responseId changes and fragment differs', () => {
    const fullEngine = getFullEngine(engine);
    const biActions = getOrCreateBackendInterfacesActions(TEST_ID);
    const genActions = getOrCreateGenerativeActions(TEST_ID);

    fullEngine.mutate(genActions.setConversationSessionId('sess-1'));
    fullEngine.mutate(
      biActions.createInterface({
        interfaceId: 'ui-1',
        type: 'product_search',
        display: 'main',
        state: {
          query: 'shoes',
          products: [],
          facets: [],
          pagination: {page: 0, pageSize: 20, totalEntries: 50, totalPages: 3},
          sort: {appliedSort: {sortCriteria: 'relevance'}, availableSorts: []},
          responseId: 'r1',
        },
      })
    );

    const controller = buildBackendUrlManagerController({
      interface: generativeInterface,
      converseController,
      interfaceId: 'ui-1',
    });

    const listener = vi.fn();
    controller.subscribe(listener);

    fullEngine.mutate(
      biActions.updateInterfaceState({
        interfaceId: 'ui-1',
        state: {
          query: 'boots',
          products: [],
          facets: [],
          pagination: {page: 0, pageSize: 20, totalEntries: 30, totalPages: 2},
          sort: {appliedSort: {sortCriteria: 'relevance'}, availableSorts: []},
          responseId: 'r2',
        },
      })
    );

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('subscriber does NOT fire when responseId has not changed', () => {
    const fullEngine = getFullEngine(engine);
    const biActions = getOrCreateBackendInterfacesActions(TEST_ID);
    const genActions = getOrCreateGenerativeActions(TEST_ID);

    fullEngine.mutate(genActions.setConversationSessionId('sess-1'));
    fullEngine.mutate(
      biActions.createInterface({
        interfaceId: 'ui-1',
        type: 'product_search',
        display: 'main',
        state: {
          query: 'shoes',
          products: [],
          facets: [],
          pagination: {page: 0, pageSize: 20, totalEntries: 50, totalPages: 3},
          sort: {appliedSort: {sortCriteria: 'relevance'}, availableSorts: []},
          responseId: 'r1',
        },
      })
    );

    const controller = buildBackendUrlManagerController({
      interface: generativeInterface,
      converseController,
      interfaceId: 'ui-1',
    });

    const listener = vi.fn();
    controller.subscribe(listener);

    fullEngine.mutate(
      biActions.updateInterfaceState({
        interfaceId: 'ui-1',
        state: {
          query: 'shoes',
          products: [{name: 'New shoe'}],
          facets: [],
          pagination: {page: 0, pageSize: 20, totalEntries: 50, totalPages: 3},
          sort: {appliedSort: {sortCriteria: 'relevance'}, availableSorts: []},
          responseId: 'r1',
        },
      })
    );

    expect(listener).not.toHaveBeenCalled();
  });
});
