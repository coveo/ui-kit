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
import {buildBackendFacetController} from './backend-facet-controller.js';

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

describe('buildBackendFacetController', () => {
  let engine: Engine;
  let generativeInterface: GenerativeInterface;
  let converseController: ConverseController;

  beforeEach(() => {
    engine = createTestEngine();
    generativeInterface = createTestGenerativeInterface(engine);
    converseController = createMockConverseController();
  });

  it('returns empty state when interface does not exist', () => {
    const controller = buildBackendFacetController({
      interface: generativeInterface,
      converseController,
      interfaceId: 'ui-1',
      facetId: 'brand',
    });

    expect(controller.state).toEqual({
      facetId: 'brand',
      field: '',
      displayName: '',
      values: [],
      hasActiveValues: false,
      moreValuesAvailable: false,
    });
  });

  it('returns empty state when facet is not in interface state', () => {
    const fullEngine = getFullEngine(engine);
    const actions = getOrCreateBackendInterfacesActions(TEST_ID);

    fullEngine.mutate(
      actions.createInterface({
        interfaceId: 'ui-1',
        type: 'product_search',
        display: 'main',
        state: {
          facets: [
            {
              facetId: 'color',
              field: 'ec_color',
              displayName: 'Color',
              type: 'regular',
              values: [{value: 'Red', state: 'idle', numberOfResults: 10}],
              moreValuesAvailable: false,
            },
          ],
        },
      })
    );

    const controller = buildBackendFacetController({
      interface: generativeInterface,
      converseController,
      interfaceId: 'ui-1',
      facetId: 'brand',
    });

    expect(controller.state).toEqual({
      facetId: 'brand',
      field: '',
      displayName: '',
      values: [],
      hasActiveValues: false,
      moreValuesAvailable: false,
    });
  });

  it('reads facet state from backend interface', () => {
    const fullEngine = getFullEngine(engine);
    const actions = getOrCreateBackendInterfacesActions(TEST_ID);

    fullEngine.mutate(
      actions.createInterface({
        interfaceId: 'ui-1',
        type: 'product_search',
        display: 'main',
        state: {
          facets: [
            {
              facetId: 'brand',
              field: 'ec_brand',
              displayName: 'Brand',
              type: 'regular',
              values: [
                {value: 'Nike', state: 'selected', numberOfResults: 42},
                {value: 'Adidas', state: 'idle', numberOfResults: 30},
              ],
              moreValuesAvailable: true,
            },
          ],
        },
      })
    );

    const controller = buildBackendFacetController({
      interface: generativeInterface,
      converseController,
      interfaceId: 'ui-1',
      facetId: 'brand',
    });

    expect(controller.state).toEqual({
      facetId: 'brand',
      field: 'ec_brand',
      displayName: 'Brand',
      values: [
        {value: 'Nike', state: 'selected', numberOfResults: 42},
        {value: 'Adidas', state: 'idle', numberOfResults: 30},
      ],
      hasActiveValues: true,
      moreValuesAvailable: true,
    });
  });

  it('toggleSelect sends toggle_facet action', () => {
    const controller = buildBackendFacetController({
      interface: generativeInterface,
      converseController,
      interfaceId: 'ui-1',
      facetId: 'brand',
    });

    controller.toggleSelect('Nike');

    expect(converseController.sendAction).toHaveBeenCalledWith({
      type: 'toggle_facet',
      interfaceId: 'ui-1',
      facetId: 'brand',
      value: 'Nike',
    });
  });

  it('toggleExclude sends toggle_exclude_facet action', () => {
    const controller = buildBackendFacetController({
      interface: generativeInterface,
      converseController,
      interfaceId: 'ui-1',
      facetId: 'brand',
    });

    controller.toggleExclude('Nike');

    expect(converseController.sendAction).toHaveBeenCalledWith({
      type: 'toggle_exclude_facet',
      interfaceId: 'ui-1',
      facetId: 'brand',
      value: 'Nike',
    });
  });

  it('deselectAll sends deselect_all_facets action', () => {
    const controller = buildBackendFacetController({
      interface: generativeInterface,
      converseController,
      interfaceId: 'ui-1',
      facetId: 'brand',
    });

    controller.deselectAll();

    expect(converseController.sendAction).toHaveBeenCalledWith({
      type: 'deselect_all_facets',
      interfaceId: 'ui-1',
      facetId: 'brand',
    });
  });

  describe('facetSearch', () => {
    it('search sends facet_search action', () => {
      const controller = buildBackendFacetController({
        interface: generativeInterface,
        converseController,
        interfaceId: 'ui-1',
        facetId: 'brand',
      });

      controller.facetSearch.updateText('Ni');
      controller.facetSearch.search();

      expect(converseController.sendAction).toHaveBeenCalledWith({
        type: 'facet_search',
        interfaceId: 'ui-1',
        facetId: 'brand',
        query: 'Ni',
      });
    });

    it('select sends toggle_facet action with rawValue', () => {
      const controller = buildBackendFacetController({
        interface: generativeInterface,
        converseController,
        interfaceId: 'ui-1',
        facetId: 'brand',
      });

      controller.facetSearch.select({
        displayValue: 'Nike',
        rawValue: 'Nike',
        count: 42,
      });

      expect(converseController.sendAction).toHaveBeenCalledWith({
        type: 'toggle_facet',
        interfaceId: 'ui-1',
        facetId: 'brand',
        value: 'Nike',
      });
    });

    it('state reads from facetSearchResults in slice', () => {
      const fullEngine = getFullEngine(engine);
      const actions = getOrCreateBackendInterfacesActions(TEST_ID);

      fullEngine.mutate(
        actions.setFacetSearchResults({
          interfaceId: 'ui-1',
          results: {
            facetId: 'brand',
            query: 'Ni',
            values: [
              {displayValue: 'Nike', rawValue: 'Nike', count: 42},
              {displayValue: 'Nine West', rawValue: 'Nine West', count: 8},
            ],
            moreValuesAvailable: true,
          },
        })
      );

      const controller = buildBackendFacetController({
        interface: generativeInterface,
        converseController,
        interfaceId: 'ui-1',
        facetId: 'brand',
      });

      expect(controller.facetSearch.state).toEqual({
        query: 'Ni',
        values: [
          {displayValue: 'Nike', rawValue: 'Nike', count: 42},
          {displayValue: 'Nine West', rawValue: 'Nine West', count: 8},
        ],
        moreValuesAvailable: true,
      });
    });

    it('state returns empty values when no results exist', () => {
      const controller = buildBackendFacetController({
        interface: generativeInterface,
        converseController,
        interfaceId: 'ui-1',
        facetId: 'brand',
      });

      expect(controller.facetSearch.state).toEqual({
        query: '',
        values: [],
        moreValuesAvailable: false,
      });
    });
  });
});
