import {createReducer} from '@reduxjs/toolkit';
import {setItems, updateItemMetadata, updateItemQuantity} from './cart-actions';
import {CartState, getCartInitialState} from './cart-state';

export const cartReducer = createReducer(
  getCartInitialState(),

  (builder) => {
    builder
      .addCase(setItems, (state, {payload}) => {
        const {cart, cartItems} = payload.reduce((acc, item) => {
          return {
            cartItems: [...acc.cartItems, item.productId],
            cart: {
              ...acc.cart,
              [item.productId]: item,
            },
          } as CartState;
        }, getCartInitialState());

        state.cartItems = cartItems;
        state.cart = cart;
      })
      .addCase(updateItemQuantity, (state, {payload}) => {
        if (!(payload.productId in state.cart)) {
          addProductToCart(payload.productId, payload.quantity, state);
          return;
        }

        if (payload.quantity <= 0) {
          removeProductFromCart(payload.productId, state);
          return;
        }

        state.cart[payload.productId].quantity = payload.quantity;
        return;
      })
      .addCase(updateItemMetadata, (state, {payload}) => {
        state.cart[payload.productId] = {
          ...state.cart[payload.productId],
          ...payload,
        };
      });
  }
);

function addProductToCart(
  productId: string,
  quantity: number,
  state: CartState
) {
  if (quantity <= 0) {
    return;
  }

  state.cartItems = [...state.cartItems, productId];
  state.cart[productId] = {productId, quantity};
}

function removeProductFromCart(productId: string, state: CartState) {
  state.cartItems = state.cartItems.filter((itemId) => itemId !== productId);
  delete state.cart[productId];
}
