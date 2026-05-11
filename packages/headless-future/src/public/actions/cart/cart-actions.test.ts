import {beforeEach, describe, expect, it} from 'vitest';
import {
  Engine,
  FullEngine,
  getFullEngine,
} from '@/src/core/interface/engine/engine.js';
import {createTestEngine} from '@/src/test/test-utils.js';
import * as selectors from '@/src/core/interface/cart/cart-selectors.js';
import {loadCartActions} from './cart-actions.js';

describe('cart actions', () => {
  let engine: Engine;
  let fullEngine: FullEngine;

  beforeEach(() => {
    engine = createTestEngine();
    fullEngine = getFullEngine(engine);
  });

  it('sets and updates cart items', async () => {
    const actions = loadCartActions(engine);
    await new Promise((r) => setTimeout(r, 0));

    actions.setItems([
      {productId: 'p1', name: 'A', price: 1, quantity: 1},
      {productId: 'p1', name: 'A', price: 1, quantity: 2},
    ]);

    expect(fullEngine.read(selectors.products)).toEqual([
      {productId: 'p1', quantity: 3},
    ]);

    actions.updateItemQuantity({
      productId: 'p1',
      name: 'A',
      price: 1,
      quantity: 0,
    });

    expect(fullEngine.read(selectors.products)).toEqual([
      {productId: 'p1', quantity: 2},
    ]);
  });
});
