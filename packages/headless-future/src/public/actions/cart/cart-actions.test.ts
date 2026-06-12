import {beforeEach, describe, expect, it, vi} from 'vitest';
import {
  type Engine,
  type FullEngine,
} from '@/src/core/interface/engine/engine.js';
import * as engineModule from '@/src/core/interface/engine/engine.js';
import {cartSlice} from '@/src/core/internal/cart/cart-slice.js';
import * as cartMutators from '@/src/core/interface/cart/cart-mutators.js';
import {setItems, updateItemQuantity} from './cart-actions.js';

describe('cart actions', () => {
  let engine: Engine;
  let fullEngine: FullEngine;

  beforeEach(() => {
    engine = {} as Engine;
    fullEngine = {
      adoptSlice: vi.fn(),
      mutate: vi.fn(),
    } as unknown as FullEngine;

    vi.spyOn(engineModule, 'getFullEngine').mockReturnValue(fullEngine);
  });

  it('setItems adopts cart slice', () => {
    const items = [
      {productId: 'p1', name: 'A', price: 1, quantity: 1},
      {productId: 'p1', name: 'A', price: 1, quantity: 2},
    ];
    const payload = {items};

    setItems(engine, payload);

    expect(fullEngine.adoptSlice).toHaveBeenCalledWith(cartSlice);
  });

  it('setItems dispatches setItems mutation', () => {
    const items = [
      {productId: 'p1', name: 'A', price: 1, quantity: 1},
      {productId: 'p1', name: 'A', price: 1, quantity: 2},
    ];
    const payload = {items};
    const mutation = {type: 'cart/setItems', payload: items};

    vi.spyOn(cartMutators, 'setItems').mockReturnValue(mutation);

    setItems(engine, payload);

    expect(cartMutators.setItems).toHaveBeenCalledWith(payload);
    expect(fullEngine.mutate).toHaveBeenCalledWith(mutation);
  });

  it('updateItemQuantity adopts cart slice', () => {
    const payload = {
      item: {productId: 'p1', name: 'A', price: 1, quantity: 0},
    };

    updateItemQuantity(engine, payload);

    expect(fullEngine.adoptSlice).toHaveBeenCalledWith(cartSlice);
  });

  it('updateItemQuantity dispatches updateItemQuantity mutation', () => {
    const payload = {
      item: {productId: 'p1', name: 'A', price: 1, quantity: 0},
    };
    const mutation = {type: 'cart/updateItemQuantity', payload: payload.item};

    vi.spyOn(cartMutators, 'updateItemQuantity').mockReturnValue(mutation);

    updateItemQuantity(engine, payload);

    expect(cartMutators.updateItemQuantity).toHaveBeenCalledWith(payload);
    expect(fullEngine.mutate).toHaveBeenCalledWith(mutation);
  });
});
