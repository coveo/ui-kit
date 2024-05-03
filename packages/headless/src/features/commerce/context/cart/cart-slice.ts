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
            cartItems: [...acc.cartItems, item.sku],
            cart: {
              ...acc.cart,
              [item.sku]: item,
            },
          } as CartState;
        }, getCartInitialState());

        setItemsInState(state, cartItems, cart);
      })
      .addCase(updateItem, (state, {payload}) => {
        if (!(payload.sku in state.cart)) {
          createItemInCart(payload, state);
          return;
        }

        if (payload.quantity <= 0) {
          deleteProductFromCart(payload.sku, state);
          return;
        }

        state.cart[payload.sku] = payload;
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

  state.cartItems = [...state.cartItems, item.sku];
  state.cart[item.sku] = item;
}

function deleteProductFromCart(sku: string, state: CartState) {
  state.cartItems = state.cartItems.filter((itemId) => itemId !== sku);
  delete state.cart[sku];
}
