import {describe, expect, it} from 'vitest';
import {setItems, updateItemQuantity} from './cart-mutators.js';
import type {
  SetCartItemsPayload,
  UpdateItemQuantityPayload,
} from './cart-types.js';

const TEST_ID = 'test-interface';

describe('cart mutators', () => {
  it('setItems returns expected mutation', () => {
    const items = [
      {productId: 'p1', name: 'A', price: 10, quantity: 1},
      {productId: 'p1', name: 'A', price: 10, quantity: 2},
    ];
    const payload: SetCartItemsPayload = {items};

    expect(setItems(payload, TEST_ID)).toEqual({
      type: `${TEST_ID}/cart/setItems`,
      payload: items,
    });
  });

  it('updateItemQuantity returns expected mutation', () => {
    const item = {productId: 'p1', name: 'A', price: 10, quantity: 0};
    const payload: UpdateItemQuantityPayload = {item};

    expect(updateItemQuantity(payload, TEST_ID)).toEqual({
      type: `${TEST_ID}/cart/updateItemQuantity`,
      payload: item,
    });
  });
});
