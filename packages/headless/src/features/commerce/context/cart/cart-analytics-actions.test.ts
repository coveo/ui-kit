import {createRelay} from '@coveo/relay';
import {buildCommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {getSampleCommerceEngineConfiguration} from '../../../../app/commerce-engine/commerce-engine-configuration';
import {itemSelector} from '../../../../controllers/commerce/context/cart/headless-cart-selectors';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {clearMicrotaskQueue} from '../../../../test/unit-test-utils';
import {getContextInitialState} from '../context-state';
import {logCartAction} from './cart-analytics-actions';
import {CartItemWithMetadata} from './cart-state';

jest.mock('@coveo/relay');
jest.mock(
  '../../../../controllers/commerce/context/cart/headless-cart-selectors'
);

describe('Cart Analytics Actions', () => {
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

    it('logs #ec.cartAction with "add" action and correct payload if quantity > 0 and item does not exist in cart and the quantity > 1', async () => {
      jest
        .mocked(itemSelector)
        .mockImplementation(() => undefined as unknown as CartItemWithMetadata);

      engine.dispatch(logCartAction({...productWithoutQuantity, quantity: 3}));
      await clearMicrotaskQueue();

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit).toHaveBeenCalledWith(
        'ec.cartAction',
        getExpectedCartActionPayload('add', 3)
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

    it('logs #ec.cartAction with "add" action and correct payload if item exists in cart and new quantity > current and the quantity difference is > 1', async () => {
      jest
        .mocked(itemSelector)
        .mockImplementation(() => ({...productWithoutQuantity, quantity: 1}));

      engine.dispatch(logCartAction({...productWithoutQuantity, quantity: 5}));
      await clearMicrotaskQueue();

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit).toHaveBeenCalledWith(
        'ec.cartAction',
        getExpectedCartActionPayload('add', 4)
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

    it('logs #ec.cartAction with "remove" action and correct payload if item exists in cart and new quantity < current and the quantity difference is > 1', async () => {
      jest
        .mocked(itemSelector)
        .mockImplementation(() => ({...productWithoutQuantity, quantity: 3}));

      engine.dispatch(logCartAction({...productWithoutQuantity, quantity: 1}));
      await clearMicrotaskQueue();

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit).toHaveBeenCalledWith(
        'ec.cartAction',
        getExpectedCartActionPayload('remove', 2)
      );
    });
  });
});
