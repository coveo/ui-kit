import {
  setItems,
  updateItemQuantity,
} from '../../../../features/commerce/context/cart/cart-actions';
import {cartReducer} from '../../../../features/commerce/context/cart/cart-slice';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../test/mock-engine-v2';
import {buildCart, Cart, CartItem, CartOptions} from './headless-cart';

describe('headless commerce cart', () => {
  let engine: MockedCommerceEngine;
  let options: CartOptions;

  const item: CartItem = {
    productId: 'new-product-id',
    quantity: 1,
    name: 'new-product-name',
    price: 50,
  };
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
          productId: 'initial-product-id',
          quantity: 2,
          name: 'initial-product-name',
          price: 100,
        },
      ],
    };
    initCart();
  });

  it('adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      cart: cartReducer,
    });
  });

  it('dispatches #setItems with correct payload if options include items', () => {
    const mockedSetItems = jest.mocked(setItems);
    expect(mockedSetItems).toHaveBeenCalledWith(options.items);
  });

  it('does not dispatch #setItems if options do not include items', () => {
    options = {};
    initCart();
    expect(setItems).not.toHaveBeenCalled();
  });

  it('#empty dispatches #setItems with empty array', () => {
    const mockedSetItems = jest.mocked(setItems);

    cart.empty();

    expect(mockedSetItems).toHaveBeenCalledWith([]);
  });

  // TODO: it('#purchase logs ec.purchase with correct payload', () => { /* ... */ });

  it('#purchase dispatches #setItems with empty array', () => {
    const mockedSetItems = jest.mocked(setItems);

    cart.purchase('transaction-id', 100);

    expect(mockedSetItems).toHaveBeenCalledWith([]);
  });

  it('#updateItemMetadata dispatches #updateItemMetadata with correct payload', () => {
    const mockedUpdateItemMetadata = jest.mocked(updateItemQuantity);

    const updatedMetadata = {name: 'new-name', price: 125};
    cart.updateItemMetadata(item.productId, updatedMetadata);

    expect(mockedUpdateItemMetadata).toHaveBeenCalledWith({
      productId: item.productId,
      ...updatedMetadata,
    });
  });

  it('#updateItemQuantity does not dispatch #updateItemQuantity if new quantity is the same as previous', () => {
    const mockedUpdateItemQuantity = jest.mocked(updateItemQuantity);

    cart.updateItemQuantity(item.productId, item.quantity);

    expect(mockedUpdateItemQuantity).not.toHaveBeenCalled();
  });

  it('#updateItemQuantity dispatches #updateItemQuantity with correct payload if new quantity is different', () => {
    const mockedUpdateItemQuantity = jest.mocked(updateItemQuantity);

    cart.updateItemQuantity(item.productId, item.quantity + 1);

    expect(mockedUpdateItemQuantity).toHaveBeenCalledWith({
      productId: item.productId,
      quantity: item.quantity + 1,
    });
  });

  // TODO: it('#updateItemQuantity logs ec.cartAction with "add" action and correct payload if new quantity is greater than previous', () => { /* ... */ });
  // TODO: it('#updateItemQuantity logs ec.cartAction with "remove" action and correct payload if new quantity is smaller than previous', () => { /* ... */ });

  it('#state.cart returns the correct items', () => {
    const {cart: items} = cart.state;
    expect(items).toEqual([
      {
        productId: 'initial-product-id',
        quantity: 2,
        name: 'initial-product-name',
        price: 100,
      },
    ]);
  });

  it('#state.totalItems returns the correct total items', () => {
    options = {
      items: [
        {
          productId: 'a',
          quantity: 2,
          name: 'a',
          price: 100,
        },
        {
          productId: 'b',
          quantity: 3,
          name: 'b',
          price: 100,
        },
      ],
    };
    initCart();
    const {totalItems} = cart.state;
    expect(totalItems).toBe(5);
  });

  it('#state.totalPrice returns the correct total price', () => {
    options = {
      items: [
        {
          productId: 'a',
          quantity: 2,
          name: 'a',
          price: 100,
        },
        {
          productId: 'b',
          quantity: 3,
          name: 'b',
          price: 100,
        },
      ],
    };
    initCart();
    const {totalPrice} = cart.state;
    expect(totalPrice).toBe(500);
  });
});
