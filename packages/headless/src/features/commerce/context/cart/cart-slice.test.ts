import {createAction} from '@reduxjs/toolkit';
import {createCartKey} from '../../../../controllers/commerce/context/cart/headless-cart';
import {purchase, setItems, updateItem} from './cart-actions';
import {cartReducer} from './cart-slice';
import {
  CartItemWithMetadata,
  CartState,
  getCartInitialState,
} from './cart-state';

describe('cart-slice', () => {
  const someItem: CartItemWithMetadata = {
    productId: 'product-id',
    quantity: 10,
    name: 'product 1',
    price: 50,
  };
  const someItemKey = createCartKey(someItem);
  let state: CartState;
  beforeEach(() => {
    state = getCartInitialState();
  });

  it('should have an initial state', () => {
    expect(cartReducer(undefined, {type: 'foo'})).toEqual(
      getCartInitialState()
    );
  });

  it('#setItems replaces current cart state with specified state', () => {
    const secondItem: CartItemWithMetadata = {
      productId: 'product-id',
      quantity: 20,
      name: 'product 2',
      price: 100,
    };
    const updatedState = cartReducer(state, setItems([someItem, secondItem]));
    const updatedStatefirstItemKey = updatedState.cartItems[0];
    const updatedStatefirstItem = updatedState.cart[updatedStatefirstItemKey];
    expect(updatedStatefirstItem).toEqual(someItem);

    const updatedStateSecondItemKey = updatedState.cartItems[1];
    const updatedStateSecondItem = updatedState.cart[updatedStateSecondItemKey];
    expect(updatedStateSecondItem).toEqual(secondItem);
  });

  it('#purchase.fulfilled replaces current cart state with empty state', async () => {
    const secondItem: CartItemWithMetadata = {
      productId: 'product-id',
      quantity: 20,
      name: 'product 2',
      price: 100,
    };
    state.cartItems = [createCartKey(someItem), createCartKey(secondItem)];
    state.cart = {
      [createCartKey(someItem)]: someItem,
      [createCartKey(secondItem)]: secondItem,
    };
    const fakePurchaseAction = createAction(purchase.fulfilled.type);
    const updatedState = cartReducer(state, fakePurchaseAction());
    expect(updatedState.cartItems).toEqual([]);
    expect(updatedState.cart).toEqual({});
  });

  describe('#updateItem', () => {
    it('adds new item to cart if item is not already in cart and specified quantity is positive', () => {
      const updatedState = cartReducer(
        state,
        updateItem({item: someItem, update: someItem})
      );
      const key = createCartKey(someItem);
      expect(updatedState.cartItems).toEqual([key]);
      expect(updatedState.cart).toEqual({
        [key]: someItem,
      });
    });

    it('does not add new item to cart if item is not already in cart and specified quantity is 0', () => {
      const updatedState = cartReducer(
        state,
        updateItem({item: someItem, update: {...someItem, quantity: 0}})
      );
      expect(updatedState.cartItems).toEqual([]);
      expect(updatedState.cart).toEqual({});
    });

    it('removes existing item from cart if specified quantity is 0', () => {
      const updatedState = cartReducer(
        {
          cartItems: [someItemKey],
          cart: {
            [someItemKey]: someItem,
          },
        },
        updateItem({item: someItem, update: {...someItem, quantity: 0}})
      );
      expect(updatedState.cartItems).toEqual([]);
      expect(updatedState.cart).toEqual({});
    });

    it('updates existing item in cart if specified quantity is greater than 0', () => {
      const updatedItem = {
        ...someItem,
        name: 'renamed product',
        quantity: 5,
        price: 25,
      };
      const updatedState = cartReducer(
        {
          cartItems: [someItemKey],
          cart: {
            [someItemKey]: someItem,
          },
        },
        updateItem({item: someItem, update: updatedItem})
      );
      const updatedItemKey = createCartKey(updatedItem);
      expect(updatedState.cartItems).toEqual([updatedItemKey]);
      expect(updatedState.cart).toEqual({
        [updatedItemKey]: {
          productId: someItem.productId,
          name: 'renamed product',
          quantity: 5,
          price: 25,
        },
      });
    });
  });
});
