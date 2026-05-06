import {beforeEach, describe, expect, it} from 'vitest';
import {createTestEngine} from '@/src/test/test-utils.js';
import {
  getFullEngine,
  type FullEngine,
} from '@/src/core/interface/engine/engine.js';
import {cartSlice} from '@/src/core/internal/cart/cart-slice.js';
import * as mutators from './cart-mutators.js';
import * as selectors from './cart-selectors.js';

describe('cart mutators', () => {
  let engine: FullEngine;

  beforeEach(() => {
    engine = getFullEngine(createTestEngine());
    engine.adoptSlice(cartSlice);
  });

  it('sets and updates cart items', () => {
    engine.mutate(
      mutators.setItems([
        {productId: 'p1', name: 'A', price: 10, quantity: 1},
        {productId: 'p1', name: 'A', price: 10, quantity: 2},
      ])
    );

    expect(engine.read(selectors.items)).toHaveLength(2);
    expect(engine.read(selectors.products)).toEqual([
      {productId: 'p1', quantity: 3},
    ]);

    engine.mutate(
      mutators.updateItemQuantity({
        productId: 'p1',
        name: 'A',
        price: 10,
        quantity: 0,
      })
    );

    expect(engine.read(selectors.items)).toHaveLength(1);
    expect(engine.read(selectors.products)).toEqual([
      {productId: 'p1', quantity: 2},
    ]);
  });
});
