import {createReducer} from '@reduxjs/toolkit';
import {purchase, setItems, updateItem} from './cart-actions';
import {
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
          return {
            cartItems: [...acc.cartItems, item.productId],
            cart: {
              ...acc.cart,
              [item.productId]: item,
            },
          } as CartState;
        }, getCartInitialState());

        setItemsInState(state, cartItems, cart);
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
      })
      .addCase(purchase.fulfilled, (state) => {
        const {cart, cartItems} = getCartInitialState();
        setItemsInState(state, cartItems, cart);
      });
  }
);

function setItemsInState(
  state: CartState,
  cartItems: string[],
  cart: Record<string, CartItemWithMetadata>
) {
  state.cartItems = cartItems;
  state.cart = cart;
}

function createItemInCart(item: CartItemWithMetadata, state: CartState) {
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
