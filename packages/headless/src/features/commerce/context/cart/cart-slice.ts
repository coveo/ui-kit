import {createReducer} from '@reduxjs/toolkit';
import {CartItemParam} from '../../../../api/commerce/commerce-api-params';
import {setItems, updateItem} from './cart-actions';
import {CartItemMetadata, CartState, getCartInitialState} from './cart-state';

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
      .addCase(updateItem, (state, {payload}) => {
        if (!(payload.productId in state.cart)) {
          createItemInCart(payload, state);
          return;
        }

        if (payload.quantity <= 0) {
          deleteProductFromCart(payload.productId, state);
          return;
        }

        state.cart[payload.productId] = payload;
        return;
      });
  }
);

function createItemInCart(
  item: CartItemParam & CartItemMetadata,
  state: CartState
) {
  if (item.quantity <= 0) {
    return;
  }

  state.cartItems = [...state.cartItems, item.productId];
  state.cart[item.productId] = item;
}

function deleteProductFromCart(productId: string, state: CartState) {
  state.cartItems = state.cartItems.filter((itemId) => itemId !== productId);
  delete state.cart[productId];
}
