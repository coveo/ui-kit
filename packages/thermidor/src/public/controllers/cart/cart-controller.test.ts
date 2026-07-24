import {beforeEach, describe, expect, it, vi} from 'vitest';
import {type Engine, getFullEngine} from '@/src/internal/engine/index.js';
import {createTestEngine, createTestInterface} from '@/src/test/test-utils.js';
import {getHandleInternals} from '@/src/internal/utils/index.js';
import {getOrCreateSearchBoxSlice} from '@/src/internal/features/search-box/index.js';
import {getOrCreateSearchBoxActions} from '@/src/internal/features/search-box/index.js';
import {getOrCreateCartSlice} from '@/src/internal/features/cart/index.js';
import {getOrCreateCartActions} from '@/src/internal/features/cart/index.js';
import {buildCartController} from './cart-controller.js';

describe('buildCartController', () => {
  describe('behavior', () => {
    let engine: Engine;
    let cartInterface: ReturnType<typeof createTestInterface>;

    beforeEach(() => {
      engine = createTestEngine();
      cartInterface = createTestInterface(engine);
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
        getHandleInternals(cartInterface);

        const searchBoxSlice = getOrCreateSearchBoxSlice(cartInterface);
        const {setQuery} = getOrCreateSearchBoxActions(cartInterface);
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
    let engine: Engine;
    let cartInterface: ReturnType<typeof createTestInterface>;
    const TEST_ID = 'wiring-test';

    beforeEach(() => {
      engine = createTestEngine();
      cartInterface = createTestInterface(engine, TEST_ID);
    });

    it('adopts the scoped cart slice on construction', () => {
      const fullEngine = getFullEngine(engine);
      const adoptSpy = vi.spyOn(fullEngine, 'adoptSlice');

      buildCartController({interface: cartInterface});

      expect(adoptSpy).toHaveBeenCalledWith(getOrCreateCartSlice(cartInterface));
    });

    it('setItems() dispatches the scoped setItems action', () => {
      const fullEngine = getFullEngine(engine);
      const mutateSpy = vi.spyOn(fullEngine, 'mutate');

      const controller = buildCartController({interface: cartInterface});
      const items = [{productId: 'p1', name: 'A', price: 1, quantity: 1}];

      controller.setItems({items});

      const actions = getOrCreateCartActions(cartInterface);
      expect(mutateSpy).toHaveBeenCalledWith(actions.setItems(items));
    });

    it('updateItemQuantity() dispatches the scoped updateItemQuantity action', () => {
      const fullEngine = getFullEngine(engine);
      const mutateSpy = vi.spyOn(fullEngine, 'mutate');

      const controller = buildCartController({interface: cartInterface});
      const item = {productId: 'p1', name: 'A', price: 1, quantity: 2};

      controller.updateItemQuantity({item});

      const actions = getOrCreateCartActions(cartInterface);
      expect(mutateSpy).toHaveBeenCalledWith(actions.updateItemQuantity(item));
    });
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });
});
