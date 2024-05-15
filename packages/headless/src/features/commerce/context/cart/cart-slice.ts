import {createReducer} from '@reduxjs/toolkit';
import {createCartKey} from '../../../../controllers/commerce/context/cart/headless-cart';
import {purchase, setItems, updateItemQuantity} from './cart-actions';
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
          const key = createCartKey(item);
          return {
            cartItems: [...acc.cartItems, key],
            cart: {
              ...acc.cart,
              [key]: item,
            },
          };
        }, getCartInitialState());

        setItemsInState(state, cartItems, cart);
      })
      .addCase(updateItemQuantity, (state, {payload}) => {
        const key = createCartKey(payload);
        if (!(key in state.cart)) {
          createItemInCart(payload, state);
          return;
        }

        if (payload.quantity <= 0) {
          deleteProductFromCart(payload, state);
          return;
        }

        state.cart[key] = payload;
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

  const key = createCartKey(item);
  state.cartItems = [...state.cartItems, key];
  state.cart[key] = item;
}

function deleteProductFromCart(item: CartItemWithMetadata, state: CartState) {
  const key = createCartKey(item);
  state.cartItems = state.cartItems.filter((cartKey) => cartKey !== key);
  delete state.cart[key];
}
