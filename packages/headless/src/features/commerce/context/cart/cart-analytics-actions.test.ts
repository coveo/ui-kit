import {createRelay} from '@coveo/relay';
import {ProductQuantity} from '@coveo/relay-event-types';
import {buildCommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {getSampleCommerceEngineConfiguration} from '../../../../app/commerce-engine/commerce-engine-configuration';
import {itemSelector} from '../../../../controllers/commerce/context/cart/headless-cart-selectors';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {clearMicrotaskQueue} from '../../../../test/unit-test-utils';
import {getContextInitialState} from '../context-state';
import {
  Transaction,
  logCartAction,
  logCartPurchase,
} from './cart-analytics-actions';
import {CartItemWithMetadata} from './cart-state';

jest.mock('@coveo/relay');
jest.mock(
  '../../../../controllers/commerce/context/cart/headless-cart-selectors'
);

describe('#logCartAction', () => {
  const emit = jest.fn();
  let engine: CommerceEngine;

  function initEngine(preloadedState = buildMockCommerceState()) {
    engine = buildCommerceEngine({
      preloadedState: {
        ...preloadedState,
        commerceContext: {
          ...getContextInitialState(),
          currency: 'USD',
        },
      },
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

  describe('logCartAction', () => {
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

    const getExpectedCartActionPayload = (action: 'add' | 'remove') => ({
      action,
      product: productWithoutQuantity,
      quantity: 1,
      currency: 'USD',
    });

    it('logs #ec.cartAction with "add" action and correct payload if quantity > 0 and item does not exist in cart', async () => {
      jest
        .mocked(itemSelector)
        .mockImplementation(() => undefined as unknown as CartItemWithMetadata);

      engine.dispatch(logCartAction({...productWithoutQuantity, quantity: 1}));
      await clearMicrotaskQueue();

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit).toHaveBeenCalledWith(
        'ec.cartAction',
        getExpectedCartActionPayload('add')
      );
    });

    it('logs #ec.cartAction with "add" action and correct payload if item exists in cart and new quantity > current', async () => {
      jest
        .mocked(itemSelector)
        .mockImplementation(() => ({...productWithoutQuantity, quantity: 1}));

      engine.dispatch(logCartAction({...productWithoutQuantity, quantity: 2}));
      await clearMicrotaskQueue();

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit).toHaveBeenCalledWith(
        'ec.cartAction',
        getExpectedCartActionPayload('add')
      );
    });

    it('logs #ec.cartAction with "remove" action and correct payload if item exists in cart and new quantity < current', async () => {
      jest
        .mocked(itemSelector)
        .mockImplementation(() => ({...productWithoutQuantity, quantity: 2}));

      engine.dispatch(logCartAction({...productWithoutQuantity, quantity: 1}));
      await clearMicrotaskQueue();

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit).toHaveBeenCalledWith(
        'ec.cartAction',
        getExpectedCartActionPayload('remove')
      );
    });
  });

  describe('#logCartPurchase', () => {
    beforeEach(() => {
      initEngine();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    const convertItemToProduct = (
      items: CartItemWithMetadata[]
    ): ProductQuantity[] =>
      items.map((item) => {
        const {quantity, ...product} = item;
        return {quantity, product};
      });

    const expectCartPurchase = (
      products: ProductQuantity[],
      transaction: Transaction
    ) => {
      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit).toHaveBeenCalledWith('ec.purchase', {
        currency: 'USD',
        products,
        transaction,
      });
    };

    it('logs #ec.purchase with the expected payload', async () => {
      const cartItems = [
        {name: 'blue shoes', productId: 'shoe-1', price: 10.36, quantity: 1},
        {name: 'red shoes', productId: 'shoe-2', price: 52.19, quantity: 3},
      ];
      const products = convertItemToProduct(cartItems);
      const transaction = {id: 'transaction-2', revenue: 166.93};
      const preloadedStateWithCart = {
        ...defaultPreloadedState,
        cart: {
          cartItems: [cartItems[0].productId, cartItems[1].productId],
          cart: {
            [cartItems[0].productId]: {
              ...cartItems[0],
            },
            [cartItems[1].productId]: {
              ...cartItems[1],
            },
          },
        },
      };
      initEngine(preloadedStateWithCart);

      engine.dispatch(logCartPurchase(transaction));
      await clearMicrotaskQueue();

      expectCartPurchase(products, transaction);
    });
  });
});
