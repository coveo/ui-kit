import {createRelay} from '@coveo/relay';
import {buildCommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {getSampleCommerceEngineConfiguration} from '../../../../app/commerce-engine/commerce-engine-configuration';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {clearMicrotaskQueue} from '../../../../test/unit-test-utils';
import {getContextInitialState} from '../context-state';
import {logCartAction} from './cart-analytics-actions';

jest.mock('@coveo/relay');

describe('Cart Analytics Actions', () => {
  const emit = jest.fn();
  let engine: CommerceEngine;
  const defaultPreloadedState = {
    ...buildMockCommerceState(),
    commerceContext: {
      ...getContextInitialState(),
      currency: 'USD',
    },
  };

  function initEngine(preloadedState = defaultPreloadedState) {
    engine = buildCommerceEngine({
      preloadedState,
      configuration: {
        ...getSampleCommerceEngineConfiguration(),
        analytics: {
          analyticsMode: 'next',
          trackingId: 'sports',
        },
      },
    });
  }

  beforeEach(() => {
    jest.mocked(createRelay).mockReturnValue({
      emit,
      getMeta: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      updateConfig: jest.fn(),
      clearStorage: jest.fn(),
      version: 'foo',
    });
  });

  describe('#logCartAction', () => {
    beforeEach(() => {
      initEngine();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    const productWithoutQuantity = {
      productId: 'product-id-1',
      name: 'product-name-1',
      price: 100,
    };

    const getExpectedCartActionPayload = (
      action: 'add' | 'remove',
      quantity: number = 1
    ) => ({
      action,
      product: productWithoutQuantity,
      quantity,
      currency: 'USD',
    });

    const expectCartAction = (
      action: 'add' | 'remove',
      quantity: number | undefined = undefined
    ) => {
      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit).toHaveBeenCalledWith(
        'ec.cartAction',
        getExpectedCartActionPayload(action, quantity)
      );
    };

    it('logs #ec.cartAction with "add" action and correct payload if quantity > 0 and item does not exist in cart', async () => {
      const preloadedStateWithCartWithoutItems = {
        ...defaultPreloadedState,
        cart: {cartItems: [], cart: {}},
      };
      initEngine(preloadedStateWithCartWithoutItems);

      engine.dispatch(logCartAction({...productWithoutQuantity, quantity: 1}));
      await clearMicrotaskQueue();

      expectCartAction('add');
    });

    it('logs #ec.cartAction with "add" action and correct payload if quantity > 0 and item does not exist in cart and the quantity > 1', async () => {
      const preloadedStateWithCartWithoutItems = {
        ...defaultPreloadedState,
        cart: {cartItems: [], cart: {}},
      };
      initEngine(preloadedStateWithCartWithoutItems);

      engine.dispatch(logCartAction({...productWithoutQuantity, quantity: 3}));
      await clearMicrotaskQueue();

      expectCartAction('add', 3);
    });

    it('logs #ec.cartAction with "add" action and correct payload if item exists in cart and new quantity > current', async () => {
      const preloadedStateWithCart = {
        ...defaultPreloadedState,
        cart: {
          cartItems: [],
          cart: {
            [productWithoutQuantity.productId]: {
              ...productWithoutQuantity,
              quantity: 1,
            },
          },
        },
      };
      initEngine(preloadedStateWithCart);

      engine.dispatch(logCartAction({...productWithoutQuantity, quantity: 2}));
      await clearMicrotaskQueue();

      expectCartAction('add');
    });

    it('logs #ec.cartAction with "add" action and correct payload if item exists in cart and new quantity > current and the quantity difference is > 1', async () => {
      const preloadedStateWithCart = {
        ...defaultPreloadedState,
        cart: {
          cartItems: [],
          cart: {
            [productWithoutQuantity.productId]: {
              ...productWithoutQuantity,
              quantity: 1,
            },
          },
        },
      };
      initEngine(preloadedStateWithCart);

      engine.dispatch(logCartAction({...productWithoutQuantity, quantity: 5}));
      await clearMicrotaskQueue();

      expectCartAction('add', 4);
    });

    it('logs #ec.cartAction with "remove" action and correct payload if item exists in cart and new quantity < current', async () => {
      const preloadedStateWithCart = {
        ...defaultPreloadedState,
        cart: {
          cartItems: [],
          cart: {
            [productWithoutQuantity.productId]: {
              ...productWithoutQuantity,
              quantity: 2,
            },
          },
        },
      };
      initEngine(preloadedStateWithCart);

      engine.dispatch(logCartAction({...productWithoutQuantity, quantity: 1}));
      await clearMicrotaskQueue();

      expectCartAction('remove');
    });

    it('logs #ec.cartAction with "remove" action and correct payload if item exists in cart and new quantity < current and the quantity difference is > 1', async () => {
      const preloadedStateWithCart = {
        ...defaultPreloadedState,
        cart: {
          cartItems: [],
          cart: {
            [productWithoutQuantity.productId]: {
              ...productWithoutQuantity,
              quantity: 3,
            },
          },
        },
      };
      initEngine(preloadedStateWithCart);

      engine.dispatch(logCartAction({...productWithoutQuantity, quantity: 1}));
      await clearMicrotaskQueue();

      expectCartAction('remove', 2);
    });
  });
});
