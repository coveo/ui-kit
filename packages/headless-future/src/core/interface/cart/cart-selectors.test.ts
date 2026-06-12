import {describe, expect, it} from 'vitest';
import type {CartState} from './cart-types.js';
import {items} from './cart-selectors.js';

describe('cart selectors', () => {
  const initialCartState: CartState = {
    items: [],
  };

  const populatedCartState: CartState = {
    items: [
      {productId: 'p1', name: 'A', price: 10, quantity: 1},
      {productId: 'p2', name: 'B', price: 20, quantity: 3},
    ],
  };

  const initialState = {cart: initialCartState};
  const populatedState = {cart: populatedCartState};

  it('should expose the initial items', () => {
    expect(items(initialState)).toEqual([]);
  });

  it('should expose all items in cart', () => {
    expect(items(populatedState)).toEqual(populatedCartState.items);
  });
});
