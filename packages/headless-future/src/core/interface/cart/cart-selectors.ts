import {cartSlice} from '@/src/core/internal/cart/cart-slice.js';
import type {CartState} from './cart-types.js';

type StateWithCartSlice = {cart: CartState};

export const items = (state: StateWithCartSlice) =>
  cartSlice.selectors.items(state);
