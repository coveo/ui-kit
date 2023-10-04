import {createReducer} from '@reduxjs/toolkit';
import {
  addItem,
  removeItem,
  setItems,
  updateItemQuantity,
} from './cart-actions';
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
      .addCase(addItem, (state, {payload}) => {
        if (payload.productId in state.cart) {
          state.cart[payload.productId].quantity += payload.quantity;
          return;
        }

        state.cartItems = [...state.cartItems, payload.productId];
        state.cart[payload.productId] = payload;
      })
      .addCase(removeItem, (state, {payload}) => {
        state.cartItems = state.cartItems.filter(
          (itemId) => itemId !== payload
        );
        delete state.cart[payload];
      })
      .addCase(updateItemQuantity, (state, {payload}) => {
        if (!(payload.productId in state.cart)) {
          return;
        }

        state.cart[payload.productId].quantity = payload.quantity;
      });
  }
);
