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
import {buildBackendNumericFacetController} from './backend-numeric-facet-controller.js';

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
    restoreSession: vi.fn(),
    state: {
      turns: [],
      activeTurnId: undefined,
      activeTurn: undefined,
      isStreaming: false,
      conversationSessionId: undefined,
      conversationToken: undefined,
    },
    subscribe: vi.fn(() => () => {}),
  };
}

describe('buildBackendNumericFacetController', () => {
  let engine: Engine;
  let generativeInterface: GenerativeInterface;
  let converseController: ConverseController;

  beforeEach(() => {
    engine = createTestEngine();
    generativeInterface = createTestGenerativeInterface(engine);
    converseController = createMockConverseController();
  });

  it('returns empty state when interface does not exist', () => {
    const controller = buildBackendNumericFacetController({
      interface: generativeInterface,
      converseController,
      surfaceId: 'ui-1',
      facetId: 'price',
    });

    expect(controller.state).toEqual({
      facetId: 'price',
      field: '',
      displayName: '',
      values: [],
      hasActiveValues: false,
      domain: undefined,
      interval: '',
    });
  });

  it('reads numeric facet state from backend interface', () => {
    const fullEngine = getFullEngine(engine);
    const actions = getOrCreateBackendSurfacesActions(TEST_ID);

    fullEngine.mutate(
      actions.createSurface({
        surfaceId: 'ui-1',
        type: 'product_search',
        display: 'main',
        state: {
          facets: [
            {
              facetId: 'price',
              field: 'ec_price',
              displayName: 'Price',
              type: 'numericalRange',
              values: [
                {
                  start: 0,
                  end: 50,
                  endInclusive: true,
                  state: 'idle',
                  numberOfResults: 20,
                },
                {
                  start: 50,
                  end: 100,
                  endInclusive: true,
                  state: 'selected',
                  numberOfResults: 15,
                },
              ],
              domain: {min: 0, max: 500},
              interval: 'even',
            },
          ],
        },
      })
    );

    const controller = buildBackendNumericFacetController({
      interface: generativeInterface,
      converseController,
      surfaceId: 'ui-1',
      facetId: 'price',
    });

    expect(controller.state).toEqual({
      facetId: 'price',
      field: 'ec_price',
      displayName: 'Price',
      values: [
        {
          start: 0,
          end: 50,
          endInclusive: true,
          state: 'idle',
          numberOfResults: 20,
        },
        {
          start: 50,
          end: 100,
          endInclusive: true,
          state: 'selected',
          numberOfResults: 15,
        },
      ],
      hasActiveValues: true,
      domain: {min: 0, max: 500},
      interval: 'even',
    });
  });

  it('toggleSelect sends toggle_numeric_facet action', () => {
    const controller = buildBackendNumericFacetController({
      interface: generativeInterface,
      converseController,
      surfaceId: 'ui-1',
      facetId: 'price',
    });

    controller.toggleSelect({start: 0, end: 50, endInclusive: true});

    expect(converseController.sendAction).toHaveBeenCalledWith({
      type: 'toggle_numeric_facet',
      surfaceId: 'ui-1',
      facetId: 'price',
      start: 0,
      end: 50,
      endInclusive: true,
    });
  });

  it('setRange sends set_numeric_facet_range action', () => {
    const controller = buildBackendNumericFacetController({
      interface: generativeInterface,
      converseController,
      surfaceId: 'ui-1',
      facetId: 'price',
    });

    controller.setRange({start: 25, end: 75, endInclusive: true});

    expect(converseController.sendAction).toHaveBeenCalledWith({
      type: 'set_numeric_facet_range',
      surfaceId: 'ui-1',
      facetId: 'price',
      start: 25,
      end: 75,
      endInclusive: true,
    });
  });

  it('deselectAll sends deselect_all_facets action', () => {
    const controller = buildBackendNumericFacetController({
      interface: generativeInterface,
      converseController,
      surfaceId: 'ui-1',
      facetId: 'price',
    });

    controller.deselectAll();

    expect(converseController.sendAction).toHaveBeenCalledWith({
      type: 'deselect_all_facets',
      surfaceId: 'ui-1',
      facetId: 'price',
    });
  });
});
