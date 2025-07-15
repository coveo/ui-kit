import {createAction} from '@reduxjs/toolkit';
import {createCartKey} from '../../../../controllers/commerce/context/cart/headless-cart.js';
import {purchase, setItems, updateItemQuantity} from './cart-actions.js';
import {cartReducer} from './cart-slice.js';
import {
  type CartItemWithMetadata,
  type CartState,
  getCartInitialState,
} from './cart-state.js';

describe('cart-slice', () => {
  const someItem: CartItemWithMetadata = {
    productId: 'product-id',
    quantity: 10,
    name: 'product 1',
    price: 50,
  };
  const someItemKey = createCartKey(someItem);
  const secondItem: CartItemWithMetadata = {
    productId: 'product-id',
    quantity: 20,
    name: 'product 2',
    price: 100,
  };
  const secondItemKey = createCartKey(secondItem);
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
    const updatedState = cartReducer(state, setItems([someItem, secondItem]));
    const updatedStatefirstItemKey = updatedState.cartItems[0];
    const updatedStatefirstItem = updatedState.cart[updatedStatefirstItemKey];
    expect(updatedStatefirstItem).toEqual(someItem);

    const updatedStateSecondItemKey = updatedState.cartItems[1];
    const updatedStateSecondItem = updatedState.cart[updatedStateSecondItemKey];
    expect(updatedStateSecondItem).toEqual(secondItem);
  });

  describe('#purchase.fulfilled', () => {
    it('replaces current cart state with empty state', async () => {
      state.cartItems = [someItemKey, secondItemKey];
      state.cart = {
        [someItemKey]: someItem,
        [secondItemKey]: secondItem,
      };
      const fakePurchaseAction = createAction(purchase.type);
      const updatedState = cartReducer(state, fakePurchaseAction());
      expect(updatedState.cartItems).toEqual([]);
      expect(updatedState.cart).toEqual({});
    });

    it('updates purchased state with cart items', () => {
      state.cartItems = [someItemKey, secondItemKey];
      state.cart = {
        [someItemKey]: someItem,
        [secondItemKey]: secondItem,
      };
      const fakePurchaseAction = createAction(purchase.type);
      const updatedState = cartReducer(state, fakePurchaseAction());
      expect(updatedState.purchasedItems).toEqual([someItemKey, secondItemKey]);
      expect(updatedState.purchased).toEqual({
        [someItemKey]: someItem,
        [secondItemKey]: secondItem,
      });
    });

    it('updates purchased state with cart items, merging identical items', () => {
      state.cartItems = [someItemKey, secondItemKey];
      state.cart = {
        [someItemKey]: someItem,
        [secondItemKey]: secondItem,
      };
      state.purchasedItems = [someItemKey, secondItemKey];
      state.purchased = {
        [someItemKey]: someItem,
        [secondItemKey]: secondItem,
      };

      const fakePurchaseAction = createAction(purchase.type);
      const updatedState = cartReducer(state, fakePurchaseAction());
      expect(updatedState.purchasedItems).toEqual([someItemKey, secondItemKey]);
      expect(updatedState.purchased).toEqual({
        [someItemKey]: {
          ...someItem,
          quantity: someItem.quantity * 2,
        },
        [secondItemKey]: {
          ...secondItem,
          quantity: secondItem.quantity * 2,
        },
      });
    });

    it('retains previous purchased items', () => {
      state.cartItems = [secondItemKey];
      state.cart = {
        [secondItemKey]: secondItem,
      };
      state.purchasedItems = [someItemKey];
      state.purchased = {
        [someItemKey]: someItem,
      };

      const fakePurchaseAction = createAction(purchase.type);
      const updatedState = cartReducer(state, fakePurchaseAction());
      expect(updatedState.purchasedItems).toEqual([someItemKey, secondItemKey]);
      expect(updatedState.purchased).toEqual({
        [someItemKey]: {
          ...someItem,
          quantity: someItem.quantity,
        },
        [secondItemKey]: {
          ...secondItem,
          quantity: secondItem.quantity,
        },
      });
    });
  });

  describe('#updateItemQuantity', () => {
    it('adds new item to cart if item is not already in cart and specified quantity is positive', () => {
      const updatedState = cartReducer(state, updateItemQuantity(someItem));
      expect(updatedState.cartItems).toEqual([someItemKey]);
      expect(updatedState.cart).toEqual({
        [someItemKey]: someItem,
      });
    });

    it('does not add new item to cart if item is not already in cart and specified quantity is 0', () => {
      const updatedState = cartReducer(
        state,
        updateItemQuantity({...someItem, quantity: 0})
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
          purchasedItems: [],
          purchased: {},
        },
        updateItemQuantity({...someItem, quantity: 0})
      );
      expect(updatedState.cartItems).toEqual([]);
      expect(updatedState.cart).toEqual({});
    });

    it('updates existing item in cart if specified quantity is greater than 0', () => {
      const updatedItem = {
        ...someItem,
        quantity: 5,
      };
      const updatedState = cartReducer(
        {
          cartItems: [someItemKey],
          cart: {
            [someItemKey]: someItem,
          },
          purchasedItems: [],
          purchased: {},
        },
        updateItemQuantity(updatedItem)
      );
      const updatedItemKey = createCartKey(updatedItem);
      expect(updatedState.cartItems).toEqual([updatedItemKey]);
      expect(updatedState.cart).toEqual({
        [updatedItemKey]: {
          productId: someItem.productId,
          name: someItem.name,
          price: someItem.price,
          quantity: 5,
        },
      });
    });
  });
});
