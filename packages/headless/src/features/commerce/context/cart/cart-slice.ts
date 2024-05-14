import {createReducer} from '@reduxjs/toolkit';
import {createCartKey} from '../../../../controllers/commerce/context/cart/headless-cart';
import {purchase, setItems, updateItemQuantity} from './cart-actions';
import {
  Cart,
  CartItemWithMetadata,
  CartState,
  getCartInitialState,
} from './cart-state';

export const cartReducer = createReducer(
  getCartInitialState(),

  (builder) => {
    builder
      .addCase(setItems, (state, {payload}) => {
        const {cart, cartItems} = payload.reduce((acc, item) => {
          const key = createCartKey(item);
          const cartItems = [...acc.cartItems, key];
          return {
            cartItems,
            cart: {
              ...acc.cart,
              [key]: acc.cart[key]
                ? {
                    ...acc.cart[key],
                    [item.price]: item,
                  }
                : {[item.price]: item},
            },
          };
        }, getCartInitialState());

        setItemsInState(state, cartItems, cart);
      })
      .addCase(updateItemQuantity, (state, {payload}) => {
        if (payload.quantity <= 0) {
          deleteItemFromCart(payload, state);
          return;
        }

        const key = createCartKey(payload);
        if (!(key in state.cart)) {
          createProductInCart(payload, state);
          return;
        }

        state.cart[key][payload.price] = payload;
        return;
      })
      .addCase(purchase.fulfilled, (state) => {
        const {cart, cartItems} = getCartInitialState();
        setItemsInState(state, cartItems, cart);
      });
  }
);

function setItemsInState(state: CartState, cartItems: string[], cart: Cart) {
  state.cartItems = cartItems;
  state.cart = cart;
}

function createProductInCart(item: CartItemWithMetadata, state: CartState) {
  if (item.quantity <= 0) {
    return;
  }

  const key = createCartKey(item);
  state.cartItems = [...state.cartItems, key];
  state.cart[key] = {[item.price]: item};
}

function deleteItemFromCart(item: CartItemWithMetadata, state: CartState) {
  const key = createCartKey(item);
  state.cartItems = state.cartItems.filter((cartKey) => cartKey !== key);
  if (key in state.cart) {
    delete state.cart[key][item.price];
    if (!Object.keys(state.cart[key]).length) {
      delete state.cart[key];
    }
  }
}
