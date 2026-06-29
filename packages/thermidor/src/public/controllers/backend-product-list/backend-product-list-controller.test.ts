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
import {buildBackendProductListController} from './backend-product-list-controller.js';

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

describe('buildBackendProductListController', () => {
  let engine: Engine;
  let generativeInterface: GenerativeInterface;

  beforeEach(() => {
    engine = createTestEngine();
    generativeInterface = createTestGenerativeInterface(engine);
  });

  it('returns empty products when interface does not exist', () => {
    const controller = buildBackendProductListController({
      interface: generativeInterface,
      interfaceId: 'ui-1',
    });

    expect(controller.state.products).toEqual([]);
  });

  it('returns products from backend interface state', () => {
    const fullEngine = getFullEngine(engine);
    const actions = getOrCreateBackendInterfacesActions(TEST_ID);

    fullEngine.mutate(
      actions.createInterface({
        interfaceId: 'ui-1',
        type: 'product_search',
        display: 'main',
        state: {products: [{ec_name: 'Shoe', ec_price: 99}]},
      })
    );

    const controller = buildBackendProductListController({
      interface: generativeInterface,
      interfaceId: 'ui-1',
    });

    expect(controller.state.products).toEqual([
      {ec_name: 'Shoe', ec_price: 99},
    ]);
  });

  it('updates when backend interface state changes', () => {
    const fullEngine = getFullEngine(engine);
    const actions = getOrCreateBackendInterfacesActions(TEST_ID);

    fullEngine.mutate(
      actions.createInterface({
        interfaceId: 'ui-1',
        type: 'product_search',
        display: 'main',
        state: {products: []},
      })
    );

    const controller = buildBackendProductListController({
      interface: generativeInterface,
      interfaceId: 'ui-1',
    });

    const callback = vi.fn();
    controller.subscribe(callback);

    fullEngine.mutate(
      actions.updateInterfaceState({
        interfaceId: 'ui-1',
        state: {products: [{ec_name: 'Hat'}]},
      })
    );

    expect(callback).toHaveBeenCalled();
    expect(controller.state.products).toEqual([{ec_name: 'Hat'}]);
  });
});
