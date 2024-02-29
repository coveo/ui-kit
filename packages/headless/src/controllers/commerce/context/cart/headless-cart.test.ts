import {setItems} from '../../../../features/commerce/context/cart/cart-actions';
import {cartReducer} from '../../../../features/commerce/context/cart/cart-slice';
import {CartItemWithMetadata} from '../../../../features/commerce/context/cart/cart-state';
import {getContextInitialState} from '../../../../features/commerce/context/context-state';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../test/mock-engine-v2';
import {buildCart, Cart, CartInitialState} from './headless-cart';
import {
  itemSelector,
  itemsSelector,
  totalPriceSelector,
  totalQuantitySelector,
} from './headless-cart-selectors';

jest.mock('../../../../features/commerce/context/cart/cart-actions');
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
          productId: 'product-id-1',
          quantity: 2,
          name: 'product-name-1',
          price: 100,
        },
        {
          productId: 'product-id-2',
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

  it('#empty calls #updateItem with quantity of 0 for each item in the cart', () => {
    const updateItemSpy = jest.spyOn(cart, 'updateItem');
    jest.mocked(itemsSelector).mockReturnValue(initialState.items!);

    cart.empty();

    const item = initialState.items![0];

    expect(updateItemSpy).toHaveBeenCalledWith({
      ...item,
      quantity: 0,
    });
  });

  describe('#purchase', () => {
    // TODO LENS-1498: it('logs #ec.purchase with correct payload', () => { /* ... */ });

    it('dispatches #setItems with empty array', () => {
      const mockedSetItems = jest.mocked(setItems);

      cart.purchase('', 0);

      expect(mockedSetItems).toHaveBeenCalledWith([]);
    });
  });

  describe('#updateItem', () => {
    const productWithoutQuantity = {
      productId: 'product-id-1',
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
      currency: 'USD',
    });

    const expectCartAction = (
      action: 'add' | 'remove',
      quantity: number | undefined = undefined
    ) => {
      expect(engine.relay.emit).toHaveBeenCalledTimes(1);
      expect(engine.relay.emit).toHaveBeenCalledWith(
        'ec.cartAction',
        getExpectedCartActionPayload(action, quantity)
      );
    };

    it('emits #ec.cartAction with "add" action and correct payload if quantity > 0 and item does not exist in cart', async () => {
      jest
        .mocked(itemSelector)
        .mockReturnValue(undefined as unknown as CartItemWithMetadata);

      cart.updateItem(productWithQuantity(3));

      expectCartAction('add', 3);
    });

    it('emits #ec.cartAction with "add" action and correct payload if item exists in cart and new quantity > current', async () => {
      jest.mocked(itemSelector).mockReturnValue(productWithQuantity(1));

      cart.updateItem(productWithQuantity(5));

      expectCartAction('add', 4);
    });

    it('emits #ec.cartAction with "remove" action and correct payload if item exists in cart and new quantity < current', async () => {
      jest.mocked(itemSelector).mockReturnValue(productWithQuantity(3));

      cart.updateItem(productWithQuantity(1));

      expectCartAction('remove', 2);
    });

    it('will not emit #ec.cartAction if item exists in cart and new quantity = current', () => {
      jest.mocked(itemSelector).mockReturnValue(productWithQuantity(3));

      cart.updateItem(productWithQuantity(3));

      expect(engine.relay.emit).toHaveBeenCalledTimes(0);
    });

    it('will not emits #ec.cartAction if item does not exist in cart and new quantity = 0', () => {
      jest
        .mocked(itemSelector)
        .mockReturnValue(undefined as unknown as CartItemWithMetadata);

      cart.updateItem({...productWithoutQuantity, quantity: 0});

      expect(engine.relay.emit).toHaveBeenCalledTimes(0);
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
