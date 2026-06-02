import {describe, it, expect} from 'vitest';
import {cartSlice, initialCartState} from './cart-slice.js';
import * as cartActions from './cart-actions.js';
import type {CartItem} from '@/src/core/interface/cart/cart-types.js';

const item = (overrides: Partial<CartItem> = {}): CartItem => ({
  productId: 'p1',
  name: 'Product',
  price: 10,
  quantity: 1,
  ...overrides,
});

describe('cartSlice', () => {
  describe('setItems', () => {
    it('sets items', () => {
      const items = [item(), item({productId: 'p2'})];
      const state = cartSlice.reducer(
        initialCartState,
        cartActions.setItems(items)
      );
      expect(state.items).toEqual(items);
    });

    it('replaces existing items', () => {
      const old = {items: [item()]};
      const state = cartSlice.reducer(old, cartActions.setItems([]));
      expect(state.items).toEqual([]);
    });
  });

  describe('updateItemQuantity', () => {
    it('adds a new item when not found and quantity > 0', () => {
      const state = cartSlice.reducer(
        initialCartState,
        cartActions.updateItemQuantity(item({quantity: 2}))
      );
      expect(state.items).toEqual([item({quantity: 2})]);
    });

    it('does not add when not found and quantity <= 0', () => {
      const state = cartSlice.reducer(
        initialCartState,
        cartActions.updateItemQuantity(item({quantity: 0}))
      );
      expect(state.items).toEqual([]);
    });

    it('updates quantity of existing item', () => {
      const existing = {items: [item({quantity: 1})]};
      const state = cartSlice.reducer(
        existing,
        cartActions.updateItemQuantity(item({quantity: 5}))
      );
      expect(state.items).toEqual([item({quantity: 5})]);
    });

    it('removes item when quantity <= 0', () => {
      const existing = {items: [item({quantity: 3})]};
      const state = cartSlice.reducer(
        existing,
        cartActions.updateItemQuantity(item({quantity: 0}))
      );
      expect(state.items).toEqual([]);
    });

    it('matches by composite key (productId, name, price)', () => {
      const existing = {items: [item({productId: 'p1', name: 'A', price: 5})]};
      const state = cartSlice.reducer(
        existing,
        cartActions.updateItemQuantity({
          productId: 'p1',
          name: 'A',
          price: 5,
          quantity: 9,
        })
      );
      expect(state.items[0].quantity).toBe(9);
    });

    it('treats different price as different item', () => {
      const existing = {items: [item({price: 5})]};
      const state = cartSlice.reducer(
        existing,
        cartActions.updateItemQuantity(item({price: 10, quantity: 2}))
      );
      expect(state.items).toHaveLength(2);
    });
  });
});
