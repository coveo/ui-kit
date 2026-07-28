import {describe, it, expect} from 'vitest';
import {createCartSlice, initialCartState} from './cart-slice.js';
import {getOrCreateCartActions} from './cart-actions.js';
import type {CartItem} from './cart-types.js';
import {createTestEngine, createTestInterface} from '@/src/test/test-utils.js';

const TEST_ID = 'test-cart';

const item = (overrides: Partial<CartItem> = {}): CartItem => ({
  productId: 'p1',
  name: 'Product',
  price: 10,
  quantity: 1,
  ...overrides,
});

describe('cartSlice', () => {
  const engine = createTestEngine();
  const iface = createTestInterface(engine, TEST_ID);
  const actions = getOrCreateCartActions(iface);
  const slice = createCartSlice(TEST_ID, actions);

  describe('setItems', () => {
    it('sets items', () => {
      const items = [item(), item({productId: 'p2'})];
      const state = slice.reducer(initialCartState, actions.setItems(items));
      expect(state.items).toEqual(items);
    });

    it('replaces existing items', () => {
      const old = {items: [item()]};
      const state = slice.reducer(old, actions.setItems([]));
      expect(state.items).toEqual([]);
    });
  });

  describe('updateItemQuantity', () => {
    it('adds a new item when not found and quantity > 0', () => {
      const state = slice.reducer(
        initialCartState,
        actions.updateItemQuantity(item({quantity: 2}))
      );
      expect(state.items).toEqual([item({quantity: 2})]);
    });

    it('does not add when not found and quantity <= 0', () => {
      const state = slice.reducer(
        initialCartState,
        actions.updateItemQuantity(item({quantity: 0}))
      );
      expect(state.items).toEqual([]);
    });

    it('updates quantity of existing item', () => {
      const existing = {items: [item({quantity: 1})]};
      const state = slice.reducer(existing, actions.updateItemQuantity(item({quantity: 5})));
      expect(state.items).toEqual([item({quantity: 5})]);
    });

    it('removes item when quantity <= 0', () => {
      const existing = {items: [item({quantity: 3})]};
      const state = slice.reducer(existing, actions.updateItemQuantity(item({quantity: 0})));
      expect(state.items).toEqual([]);
    });

    it('matches by composite key (productId, name, price)', () => {
      const existing = {items: [item({productId: 'p1', name: 'A', price: 5})]};
      const state = slice.reducer(
        existing,
        actions.updateItemQuantity({
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
      const state = slice.reducer(
        existing,
        actions.updateItemQuantity(item({price: 10, quantity: 2}))
      );
      expect(state.items).toHaveLength(2);
    });
  });
});
