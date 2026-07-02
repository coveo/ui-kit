import {describe, it, expect, beforeEach} from 'vitest';
import {createTestEngine, createTestInterface} from '@/src/test/test-utils.js';
import {setItems, updateItemQuantity} from './cart-mutators.js';
import {FullEngine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {getOrCreateCartSlice} from '@/src/core/internal/cart/cart-slice.js';
import {getOrCreateCartSelectors} from '@/src/core/internal/cart/cart-selectors.js';
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
    const mutation = setItems(
      {items: [{productId: 'p1', name: 'A', price: 1, quantity: 2}]},
      iface
    );
    expect(mutation).toHaveProperty('type');
    expect(mutation).toHaveProperty('payload');
  });

  it('updateItemQuantity returns expected mutation', () => {
    const mutation = updateItemQuantity(
      {item: {productId: 'p1', name: 'A', price: 1, quantity: 3}},
      iface
    );
    expect(mutation).toHaveProperty('type');
    expect(mutation).toHaveProperty('payload');
  });
});
