import {describe, expect, it} from 'vitest';
import {getOrCreateCartSelectors} from '@/src/core/internal/cart/cart-selectors.js';

const TEST_ID = 'test-interface';

describe('getOrCreateCartSelectors', () => {
  const selectors = getOrCreateCartSelectors(TEST_ID);

  it('should return empty items when slice is not adopted', () => {
    const state = {};
    expect(selectors.getItems(state)).toEqual([]);
  });

  it('should expose all items in cart', () => {
    const items = [
      {productId: 'p1', name: 'A', price: 10, quantity: 1},
      {productId: 'p2', name: 'B', price: 20, quantity: 3},
    ];
    const state = {[`${TEST_ID}/cart`]: {items}};
    expect(selectors.getItems(state)).toEqual(items);
  });
});
