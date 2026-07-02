import {describe, it, expect, beforeEach} from 'vitest';
import {createTestEngine, createTestInterface} from '@/src/test/test-utils.js';
import {setItems, updateItemQuantity} from './cart-mutators.js';
import {FullEngine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {getOrCreateCartSlice} from '@/src/core/internal/cart/cart-slice.js';
import type {SearchInterface} from '@/src/public/interfaces/search.js';

describe('cart mutators', () => {
  let engine: FullEngine;
  let iface: SearchInterface;

  beforeEach(() => {
    const rawEngine = createTestEngine();
    engine = getFullEngine(rawEngine);
    iface = createTestInterface(rawEngine, 'default');
    engine.adoptSlice(getOrCreateCartSlice(iface));
  });

  it('setItems returns expected mutation', () => {
    const items = [{productId: 'p1', name: 'A', price: 1, quantity: 2}];
    const mutation = setItems({items}, iface);
    expect(mutation.type).toBe('default/cart/setItems');
    expect(mutation.payload).toEqual(items);
  });

  it('updateItemQuantity returns expected mutation', () => {
    const item = {productId: 'p1', name: 'A', price: 1, quantity: 3};
    const mutation = updateItemQuantity({item}, iface);
    expect(mutation.type).toBe('default/cart/updateItemQuantity');
    expect(mutation.payload).toEqual(item);
  });
});
