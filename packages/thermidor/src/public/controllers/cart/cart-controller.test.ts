import {beforeEach, describe, expect, it, vi} from 'vitest';
import {
  type Engine,
  type FullEngine,
  getFullEngine,
} from '@/src/core/interface/engine/engine.js';
import {createTestEngine, createTestInterface} from '@/src/test/test-utils.js';
import {getOrCreateSearchBoxSlice} from '@/src/core/internal/search-box/search-box-slice.js';
import {getOrCreateSearchBoxActions} from '@/src/core/internal/search-box/search-box-actions.js';
import {getOrCreateCartSlice} from '@/src/core/internal/cart/cart-slice.js';
import {getOrCreateCartActions} from '@/src/core/internal/cart/cart-actions.js';
import {ENGINE, STATE_ID} from '@/src/core/interface/utils/symbols.js';
import type {Requires} from '@/src/core/interface/utils/interface-types.js';
import {buildCartController} from './cart-controller.js';

describe('buildCartController', () => {
  describe('behavior', () => {
    let engine: Engine;
    let cartInterface: Requires<'search'>;

    beforeEach(() => {
      engine = createTestEngine();
      cartInterface = createTestInterface(engine, {
        search: [],
        suggestions: [],
      });
    });

    describe('subscribe()', () => {
      it('invokes callback when cart state changes', () => {
        const controller = buildCartController({interface: cartInterface});
        const callback = vi.fn();

        controller.subscribe(callback);
        controller.setItems({
          items: [{productId: 'p1', name: 'A', price: 1, quantity: 1}],
        });

        expect(callback).toHaveBeenCalledTimes(1);
      });

      it('does not invoke callback for unrelated state changes', () => {
        const controller = buildCartController({interface: cartInterface});
        const callback = vi.fn();
        const fullEngine = getFullEngine(engine);

        const searchBoxSlice = getOrCreateSearchBoxSlice('test-cart');
        const {setQuery} = getOrCreateSearchBoxActions('test-cart');
        fullEngine.adoptSlice(searchBoxSlice);
        controller.subscribe(callback);
        fullEngine.mutate(setQuery('q'));

        expect(callback).not.toHaveBeenCalled();
      });
    });

    describe('state', () => {
      it('returns an empty items array initially', () => {
        const controller = buildCartController({interface: cartInterface});

        expect(controller.state).toEqual({items: []});
      });

      it('reflects state changes after setItems()', () => {
        const controller = buildCartController({interface: cartInterface});

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

      it('reflects state changes after updateItemQuantity()', () => {
        const controller = buildCartController({interface: cartInterface});

        controller.setItems({
          items: [{productId: 'p1', name: 'A', price: 1, quantity: 1}],
        });
        controller.updateItemQuantity({
          item: {productId: 'p1', name: 'A', price: 1, quantity: 3},
        });

        expect(controller.state).toEqual({
          items: [{productId: 'p1', name: 'A', price: 1, quantity: 3}],
        });
      });
    });
  });

  describe('wiring', () => {
    let fullEngine: FullEngine;
    let cartInterface: Requires<'search'>;
    const TEST_ID = 'wiring-test';

    beforeEach(() => {
      fullEngine = {
        adoptSlice: vi.fn(),
        read: vi.fn(() => ({items: []})),
        mutate: vi.fn(),
        subscribe: vi.fn(),
      } as unknown as FullEngine;

      cartInterface = {
        [ENGINE]: fullEngine,
        [STATE_ID]: TEST_ID,
      } as unknown as Requires<'search'>;
    });

    it('adopts the scoped cart slice on construction', () => {
      buildCartController({interface: cartInterface});

      expect(fullEngine.adoptSlice).toHaveBeenCalledTimes(1);
      expect(fullEngine.adoptSlice).toHaveBeenCalledWith(
        getOrCreateCartSlice(TEST_ID)
      );
    });

    it('setItems() dispatches the scoped setItems action', () => {
      const controller = buildCartController({interface: cartInterface});
      const items = [{productId: 'p1', name: 'A', price: 1, quantity: 1}];

      controller.setItems({items});

      const actions = getOrCreateCartActions(TEST_ID);
      expect(fullEngine.mutate).toHaveBeenCalledWith(actions.setItems(items));
    });

    it('updateItemQuantity() dispatches the scoped updateItemQuantity action', () => {
      const controller = buildCartController({interface: cartInterface});
      const item = {productId: 'p1', name: 'A', price: 1, quantity: 2};

      controller.updateItemQuantity({item});

      const actions = getOrCreateCartActions(TEST_ID);
      expect(fullEngine.mutate).toHaveBeenCalledWith(
        actions.updateItemQuantity(item)
      );
    });

    it('state getter reads from engine via memoized selector', () => {
      const controller = buildCartController({interface: cartInterface});

      void controller.state;

      expect(fullEngine.read).toHaveBeenCalledTimes(1);
    });
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });
});
