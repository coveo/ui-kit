import {beforeEach, describe, expect, it, vi} from 'vitest';
import {Engine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {createTestEngine} from '@/src/test/test-utils.js';
import {searchBoxSlice} from '@/src/core/internal/search-box/search-box-slice.js';
import {buildCartController} from './cart-controller.js';

describe('buildCartController', () => {
  let engine: Engine;

  beforeEach(() => {
    engine = createTestEngine();
  });

  it('adopts the cart slice', () => {
    const controller = buildCartController({engine});

    expect(controller.state).toEqual({items: []});
  });

  describe('setItems()', () => {
    it('replaces cart items and exposes derived products', () => {
      const controller = buildCartController({engine});

      const items = [
        {productId: 'p1', name: 'A', price: 1, quantity: 1},
        {productId: 'p1', name: 'A', price: 1, quantity: 2},
        {productId: 'p2', name: 'B', price: 5, quantity: 4},
      ];
      controller.setItems({items});

      expect(controller.state).toEqual({
        items,
      });
    });
  });

  describe('subscribe()', () => {
    it('invokes callback when cart state changes', () => {
      const controller = buildCartController({engine});
      const callback = vi.fn();

      controller.subscribe(callback);
      controller.setItems({
        items: [{productId: 'p1', name: 'A', price: 1, quantity: 1}],
      });

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('does not invoke callback for unrelated state changes', () => {
      const controller = buildCartController({engine});
      const callback = vi.fn();
      const fullEngine = getFullEngine(engine);

      fullEngine.adoptSlice(searchBoxSlice);
      controller.subscribe(callback);
      fullEngine.mutate(searchBoxSlice.actions.setQuery('q'));

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
