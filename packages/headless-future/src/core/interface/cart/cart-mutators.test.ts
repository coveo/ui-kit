import {describe, expect, it} from 'vitest';
import * as mutators from './cart-mutators.js';
import type {
  SetCartItemsPayload,
  UpdateItemQuantityPayload,
} from './cart-types.js';

describe('cart mutators', () => {
  it('setItems returns expected mutation', () => {
    const items = [
      {productId: 'p1', name: 'A', price: 10, quantity: 1},
      {productId: 'p1', name: 'A', price: 10, quantity: 2},
    ];
    const payload: SetCartItemsPayload = {items};

    expect(mutators.setItems(payload)).toEqual({
      type: 'cart/setItems',
      payload: items,
    });
  });

  it('updateItemQuantity returns expected mutation', () => {
    const item = {productId: 'p1', name: 'A', price: 10, quantity: 0};
    const payload: UpdateItemQuantityPayload = {item};

    expect(mutators.updateItemQuantity(payload)).toEqual({
      type: 'cart/updateItemQuantity',
      payload: item,
    });
  });
});
