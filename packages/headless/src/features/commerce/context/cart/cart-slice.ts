import {createReducer} from '@reduxjs/toolkit';
import {createCartKey} from '../../../../controllers/commerce/context/cart/headless-cart';
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
      .addCase(updateItem, (state, {payload}) => {
        const updateKey = createCartKey(payload.update);
        if (!(updateKey in state.cart)) {
          deleteProductFromCart(payload.item, state);
          createItemInCart(payload.update, state);
          return;
        }

        if (payload.update.quantity <= 0) {
          deleteProductFromCart(payload.item, state);
          return;
        }

        state.cart[updateKey] = payload.update;
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
