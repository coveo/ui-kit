import {setItems} from '../../../../features/commerce/context/cart/cart-actions';
import {cartReducer} from '../../../../features/commerce/context/cart/cart-slice';
import {contextReducer} from '../../../../features/commerce/context/context-slice';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../test/mock-engine-v2';
import {buildCart, Cart, CartOptions} from './headless-cart';
import {
  itemsSelector,
  totalPriceSelector,
  totalQuantitySelector,
} from './headless-cart-selectors';

jest.mock('../../../../features/commerce/context/cart/cart-actions');
jest.mock('./headless-cart-selectors');

describe('headless commerce cart', () => {
  let engine: MockedCommerceEngine;
  let options: CartOptions;
  let cart: Cart;

  function initEngine(preloadedState = buildMockCommerceState()) {
    engine = buildMockCommerceEngine(preloadedState);
  }

  function initCart() {
    cart = buildCart(engine, {options});
  }

  beforeEach(() => {
    initEngine();
    jest.resetAllMocks();
    options = {
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

    it('adds the correct reducers to engine', () => {
      expect(engine.addReducers).toHaveBeenCalledWith({
        cart: cartReducer,
        context: contextReducer,
      });
    });

    it('dispatches #setItems with correct payload if options include items', () => {
      const mockedSetItems = jest.mocked(setItems);

      expect(mockedSetItems).toHaveBeenCalledWith(options.items);
      expect(engine.dispatch).toHaveBeenCalledWith(
        mockedSetItems.mock.results[0].value
      );
    });

    it('does not dispatch #setItems if options do not include items', () => {
      jest.resetAllMocks();
      const mockedSetItems = jest.mocked(setItems);

      options = {};
      initCart();
      expect(mockedSetItems).not.toHaveBeenCalled();
    });
  });

  it('#empty calls #updateItem with quantity of 0 for each item in the cart', () => {
    const updateItemSpy = jest.spyOn(cart, 'updateItem');
    jest.mocked(itemsSelector).mockReturnValue(options.items!);

    cart.empty();

    const item = options.items![0];

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
    // TODO LENS-1497: it('logs #ec.cartAction with "add" action and correct payload if quantity > 0 and item does not exist in cart', () => { /* ... */ });
    // TODO LENS-1497: it('logs #ec.cartAction with "add" action and correct payload if item exists in cart and new quantity > current', () => { /* ... */ });
    // TODO LENS-1497: it('logs #ec.cartAction with "remove" action and correct payload if item exists in cart and new quantity < current', () => { /* ... */ });
    // TODO LENS-1497: it('does not log #ec.cartAction if item exists in cart and new quantity = current', () => { /* ... */ });
    // TODO LENS-1497: it('does not log #ec.cartAction if item does not exist in cart and new quantity = 0', () => { /* ... */ });
  });

  describe('#state', () => {
    it('#items calls #itemsSelector', () => {
      jest.mocked(itemsSelector).mockReturnValue(options.items!);

      expect(cart.state.items).toEqual(options.items!);
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
