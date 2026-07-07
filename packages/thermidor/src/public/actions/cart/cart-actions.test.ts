import {beforeEach, describe, expect, it} from 'vitest';
import {Engine, getFullEngine} from '@/src/internal/engine/index.js';
import {createTestEngine} from '@/src/test/test-utils.js';
import {buildSearchInterface} from '@/src/public/interfaces/search.js';
import {getOrCreateCartSelectors} from '@/src/internal/features/cart/index.js';
import {loadCartActions} from './cart-actions.js';

describe('cart actions', () => {
  let engine: Engine;
  let searchInterface: ReturnType<typeof buildSearchInterface>;

  beforeEach(() => {
    engine = createTestEngine();
    searchInterface = buildSearchInterface({engine});
  });

  it('should adopt the cart slice on the engine', () => {
    loadCartActions({interface: searchInterface});
    const selectors = getOrCreateCartSelectors(searchInterface);
    const fullEngine = getFullEngine(engine);
    expect(fullEngine.read(selectors.getItems)).toEqual([]);
  });

  it('should return an object with setItems and updateItemQuantity actions', () => {
    const actions = loadCartActions({interface: searchInterface});
    expect(actions).toHaveProperty('setItems');
    expect(actions).toHaveProperty('updateItemQuantity');
    expect(typeof actions.setItems).toBe('function');
    expect(typeof actions.updateItemQuantity).toBe('function');
  });

  it('should update state when setItems is called', () => {
    const actions = loadCartActions({interface: searchInterface});
    const selectors = getOrCreateCartSelectors(searchInterface);
    const fullEngine = getFullEngine(engine);

    const items = [{productId: 'p1', name: 'A', price: 1, quantity: 2}];
    actions.setItems({items});

    expect(fullEngine.read(selectors.getItems)).toEqual(items);
  });

  it('should update state when updateItemQuantity is called', () => {
    const actions = loadCartActions({interface: searchInterface});
    const selectors = getOrCreateCartSelectors(searchInterface);
    const fullEngine = getFullEngine(engine);

    actions.setItems({
      items: [{productId: 'p1', name: 'A', price: 1, quantity: 1}],
    });
    actions.updateItemQuantity({
      item: {productId: 'p1', name: 'A', price: 1, quantity: 5},
    });

    expect(fullEngine.read(selectors.getItems)).toEqual([
      {productId: 'p1', name: 'A', price: 1, quantity: 5},
    ]);
  });
});
