import {beforeEach, describe, expect, it, vi} from 'vitest';
import {
  type Engine,
  type FullEngine,
  getFullEngine,
} from '@/src/core/interface/engine/engine.js';
import * as engineModule from '@/src/core/interface/engine/engine.js';
import {createTestEngine} from '@/src/test/test-utils.js';
import {cartSlice} from '@/src/core/internal/cart/cart-slice.js';
import {searchBoxSlice} from '@/src/core/internal/search-box/search-box-slice.js';
import {getEndpointContributorRegistry} from '@/src/core/internal/api/base-facade/endpoint-contributor-registry.js';
import {conversationEndpointKey} from '@/src/core/internal/api/base-facade/endpoint-keys.js';
import * as cartMutators from '@/src/core/interface/cart/cart-mutators.js';
import * as cartSelectors from '@/src/core/interface/cart/cart-selectors.js';
import {buildCartController} from './cart-controller.js';

describe('buildCartController', () => {
  describe('behavior', () => {
    let engine: Engine;

    beforeEach(() => {
      engine = createTestEngine();
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

      it('registers the cart request contributor once per engine', () => {
        const fullEngine = getFullEngine(engine);
        const registry = getEndpointContributorRegistry(fullEngine);

        expect(
          registry.getRegisteredContributorCount(conversationEndpointKey)
        ).toBe(0);

        buildCartController({engine});
        buildCartController({engine});

        expect(
          registry.getRegisteredContributorCount(conversationEndpointKey)
        ).toBe(1);
      });
    });

    describe('state', () => {
      it('returns an empty items array initially', () => {
        const controller = buildCartController({engine});

        expect(controller.state).toEqual({items: []});
      });

      it('reflects state changes after setItems()', () => {
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

      it('reflects state changes after updateItemQuantity()', () => {
        const controller = buildCartController({engine});

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
    let fullEngine: FullEngine;

    beforeEach(() => {
      engine = {} as Engine;
      fullEngine = {
        adoptSlice: vi.fn(),
        read: vi.fn(),
        mutate: vi.fn(),
      } as unknown as FullEngine;

      vi.spyOn(engineModule, 'getFullEngine').mockReturnValue(fullEngine);
    });

    it('adopts the cart slice on construction', () => {
      const controller = buildCartController({engine});

      expect(controller).toBeDefined();
      expect(fullEngine.adoptSlice).toHaveBeenCalledWith(cartSlice);
    });

    it('setItems() mutates with the setItems mutator result', () => {
      const controller = buildCartController({engine});
      const payload = {
        items: [{productId: 'p1', name: 'A', price: 1, quantity: 1}],
      };
      const mutation = {type: 'cart/setItems', payload: payload.items};

      vi.spyOn(cartMutators, 'setItems').mockReturnValue(mutation);

      controller.setItems(payload);

      expect(cartMutators.setItems).toHaveBeenCalledWith(payload);
      expect(fullEngine.mutate).toHaveBeenCalledWith(mutation);
    });

    it('updateItemQuantity() mutates with the updateItemQuantity mutator result', () => {
      const controller = buildCartController({engine});
      const payload = {
        item: {productId: 'p1', name: 'A', price: 1, quantity: 2},
      };
      const mutation = {type: 'cart/updateItemQuantity', payload: payload.item};

      vi.spyOn(cartMutators, 'updateItemQuantity').mockReturnValue(mutation);

      controller.updateItemQuantity(payload);

      expect(cartMutators.updateItemQuantity).toHaveBeenCalledWith(payload);
      expect(fullEngine.mutate).toHaveBeenCalledWith(mutation);
    });

    it('state getter reads using the cart items selector', () => {
      const controller = buildCartController({engine});

      void controller.state;

      expect(fullEngine.read).toHaveBeenCalledWith(cartSelectors.items);
    });
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });
});
