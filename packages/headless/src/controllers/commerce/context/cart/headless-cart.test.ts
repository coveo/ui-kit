import {
  emitCartActionEvent,
  emitPurchaseEvent,
  purchase,
  setItems,
  updateItemQuantity,
} from '../../../../features/commerce/context/cart/cart-actions.js';
import {itemsSelector} from '../../../../features/commerce/context/cart/cart-selector.js';
import {cartReducer} from '../../../../features/commerce/context/cart/cart-slice.js';
import {CartItemWithMetadata} from '../../../../features/commerce/context/cart/cart-state.js';
import {getContextInitialState} from '../../../../features/commerce/context/context-state.js';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state.js';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../test/mock-engine-v2.js';
import {
  itemSelector,
  totalPriceSelector,
  totalQuantitySelector,
} from './headless-cart-selectors.js';
import {buildCart, Cart, CartInitialState} from './headless-cart.js';

jest.mock('../../../../features/commerce/context/cart/cart-actions');
jest.mock('../../../../features/commerce/context/cart/cart-selector');
jest.mock('./headless-cart-selectors');

describe('headless commerce cart', () => {
  let engine: MockedCommerceEngine;
  let initialState: CartInitialState;
  let cart: Cart;

  function initEngine(preloadedState = buildMockCommerceState()) {
    engine = buildMockCommerceEngine(preloadedState);
  }

  function initCart() {
    cart = buildCart(engine, {initialState});
  }

  beforeEach(() => {
    initEngine();
    jest.resetAllMocks();
    initialState = {
      items: [
        {
          productId: 'product-id',
          quantity: 2,
          name: 'product-name-1',
          price: 100,
        },
        {
          productId: 'product-id',
          quantity: 4,
          name: 'product-name-2',
          price: 25,
        },
      ],
    };
    initCart();
  });

  describe('initialization', () => {
    it('initializes', () => {
      expect(cart).toBeTruthy();
    });

    it('exposes a #subscribe method', () => {
      expect(cart.subscribe).toBeTruthy();
    });

    it('adds the correct reducer to engine', () => {
      expect(engine.addReducers).toHaveBeenCalledWith({
        cart: cartReducer,
      });
    });

    it('dispatches #setItems with correct payload if options include items', () => {
      const mockedSetItems = jest.mocked(setItems);

      expect(mockedSetItems).toHaveBeenCalledWith(initialState.items);
      expect(engine.dispatch).toHaveBeenCalledWith(
        mockedSetItems.mock.results[0].value
      );
    });

    it('does not dispatch #setItems if options do not include items', () => {
      jest.resetAllMocks();
      const mockedSetItems = jest.mocked(setItems);

      initialState = {};
      initCart();
      expect(mockedSetItems).not.toHaveBeenCalled();
    });
  });

  it('#empty calls #updateItemQuantity with quantity of 0 for each item in the cart', () => {
    const updateItemQuantitySpy = jest.spyOn(cart, 'updateItemQuantity');
    jest.mocked(itemsSelector).mockReturnValue(initialState.items!);

    cart.empty();

    const item = initialState.items![0];

    expect(updateItemQuantitySpy).toHaveBeenCalledWith({
      ...item,
      quantity: 0,
    });
  });

  describe('#purchase', () => {
    beforeEach(() => {
      initEngine({
        ...buildMockCommerceState(),
        commerceContext: {...getContextInitialState(), currency: 'USD'},
      });
      initCart();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('dispatches #emitPurchase with the transaction payload', () => {
      jest.mocked(itemsSelector).mockReturnValue([]);
      const mockedEmitPurchaseEvent = jest.mocked(emitPurchaseEvent);
      const transaction = {id: 'transaction-id', revenue: 0};
      cart.purchase(transaction);

      expect(mockedEmitPurchaseEvent).toHaveBeenCalledWith(transaction);
    });

    it('dispatches #purchase', () => {
      const mockedPurchase = jest.mocked(purchase);
      const transaction = {id: 'transaction-id', revenue: 0};
      cart.purchase(transaction);

      expect(mockedPurchase).toHaveBeenCalled();
    });
  });

  describe('#updateItemQuantity', () => {
    const productWithoutQuantity = {
      productId: 'product-id',
      name: 'product-name-1',
      price: 100,
    };

    const productWithQuantity = (quantity: number) => ({
      ...productWithoutQuantity,
      quantity,
    });

    beforeEach(() => {
      initEngine({
        ...buildMockCommerceState(),
        commerceContext: {...getContextInitialState(), currency: 'USD'},
      });
      initCart();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    const getExpectedCartActionPayload = (
      action: 'add' | 'remove',
      quantity: number = 1
    ) => ({
      action,
      product: productWithoutQuantity,
      quantity,
    });

    const expectCartAction = (
      action: 'add' | 'remove',
      quantity: number | undefined = undefined
    ) => {
      const mockedEmitCartActionEvent = jest.mocked(emitCartActionEvent);
      expect(mockedEmitCartActionEvent).toHaveBeenCalledTimes(1);
      expect(mockedEmitCartActionEvent).toHaveBeenCalledWith(
        getExpectedCartActionPayload(action, quantity)
      );
    };

    it('will not dispatch an action or emit an event if the item = cartItem', () => {
      const mockedUpdateItem = jest.mocked(updateItemQuantity);
      jest.mocked(itemSelector).mockReturnValue(productWithQuantity(3));

      cart.updateItemQuantity(productWithQuantity(3));

      expect(engine.relay.emit).toHaveBeenCalledTimes(0);
      expect(mockedUpdateItem).toHaveBeenCalledTimes(0);
    });

    it('will not dispatch an action or emit an event if item does not exist in cart and item.quantity <= 0', () => {
      const mockedUpdateItem = jest.mocked(updateItemQuantity);
      jest
        .mocked(itemSelector)
        .mockReturnValue(undefined as unknown as CartItemWithMetadata);

      cart.updateItemQuantity(productWithQuantity(0));

      expect(engine.relay.emit).toHaveBeenCalledTimes(0);
      expect(mockedUpdateItem).toHaveBeenCalledTimes(0);
    });

    it('dispatches #updateItemQuantity when the item != cartItem', () => {
      const mockedUpdateItem = jest.mocked(updateItemQuantity);
      jest.mocked(itemSelector).mockReturnValue(productWithQuantity(1));

      cart.updateItemQuantity(productWithQuantity(3));

      expect(mockedUpdateItem).toHaveBeenCalledTimes(1);
    });

    it('dispatches #updateItemQuantity when the item does not exist in the cart state and item.quantity > 0', () => {
      const mockedUpdateItem = jest.mocked(updateItemQuantity);
      jest
        .mocked(itemSelector)
        .mockReturnValue(undefined as unknown as CartItemWithMetadata);

      cart.updateItemQuantity(productWithQuantity(3));

      expect(mockedUpdateItem).toHaveBeenCalledTimes(1);
    });

    it('dispatches #updateItemQuantity but does not dispatch #emitCartAction when the item.quantity = cartItem.quantity but item != cartItem', () => {
      const mockedUpdateItem = jest.mocked(updateItemQuantity);
      const mockedEmitCartActionEvent = jest.mocked(emitCartActionEvent);
      jest
        .mocked(itemSelector)
        .mockReturnValue({...productWithQuantity(3), name: 'bap'});

      cart.updateItemQuantity(productWithQuantity(3));

      expect(mockedUpdateItem).toHaveBeenCalledTimes(1);
      expect(mockedEmitCartActionEvent).toHaveBeenCalledTimes(0);
    });

    it('dispatches #emitCartAction with "add" action and correct payload if quantity > 0 and item does not exist in cart', () => {
      jest
        .mocked(itemSelector)
        .mockReturnValue(undefined as unknown as CartItemWithMetadata);

      cart.updateItemQuantity(productWithQuantity(3));

      expectCartAction('add', 3);
    });

    it('dispatches #emitCartAction with "add" action and correct payload if item exists in cart and new quantity > current', () => {
      jest.mocked(itemSelector).mockReturnValue(productWithQuantity(1));

      cart.updateItemQuantity(productWithQuantity(5));

      expectCartAction('add', 4);
    });

    it('dispatches #emitCartAction with "remove" action and correct payload if item exists in cart and new quantity < current', () => {
      jest.mocked(itemSelector).mockReturnValue(productWithQuantity(3));

      cart.updateItemQuantity(productWithQuantity(1));

      expectCartAction('remove', 2);
    });
  });

  describe('#state', () => {
    it('#items calls #itemsSelector', () => {
      jest.mocked(itemsSelector).mockReturnValue(initialState.items!);

      expect(cart.state.items).toEqual(initialState.items!);
    });

    it('#totalQuantity calls #totalPriceSelector', () => {
      jest.mocked(totalQuantitySelector).mockReturnValue(6);

      expect(cart.state.totalQuantity).toBe(6);
    });

    it('#totalPrice calls #totalPriceSelector', () => {
      jest.mocked(totalPriceSelector).mockReturnValue(200);

      expect(cart.state.totalPrice).toBe(200);
    });
  });
});
