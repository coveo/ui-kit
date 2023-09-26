import {createReducer} from '@reduxjs/toolkit';
import {CartState, getCartInitialState} from './cart-state';
import {addItem, removeItem, setItems, updateItemQuantity} from './cart-actions';

export const cartReducer = createReducer(
  getCartInitialState(),

  (builder) => {
    builder
      .addCase(setItems, (state, {payload}) => {
        const {cart, cartItems} = payload.cart.reduce((acc, item) => {
          return ({
            cartItems: [...acc.cartItems, item.productId],
            cart: {
              ...acc.cart,
              [item.productId]: item
            }
          }) as CartState;
        }, getCartInitialState());

        state.cartItems = cartItems;
        state.cart = cart;
      })
      .addCase(addItem, (state, {payload}) => {
        state.cartItems = [...state.cartItems, payload.productId]
        state.cart[payload.productId] = payload
      })
      .addCase(removeItem, (state, {payload}) => {
        state.cartItems = state.cartItems.filter((itemId) => itemId !== payload.productId)
        delete state.cart[payload.productId]
      })
      .addCase(updateItemQuantity, (state, {payload}) => {
        state.cart[payload.productId].quantity = payload.quantity
      })
  }
);
