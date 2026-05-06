import {cartSlice} from '@/src/core/internal/cart/cart-slice.js';
import {getProductsFromCartState, type CartState} from './cart-types.js';

type StateWithCartSlice = {cart: CartState};

export const items = (state: StateWithCartSlice) =>
  cartSlice.selectors.items(state);

export const products = (state: StateWithCartSlice) =>
  getProductsFromCartState(state.cart);
