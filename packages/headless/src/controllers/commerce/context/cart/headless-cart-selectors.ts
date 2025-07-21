import {createSelector} from '@reduxjs/toolkit';
import {itemsSelector} from '../../../../features/commerce/context/cart/cart-selector.js';
import type {CartState} from '../../../../features/commerce/context/cart/cart-state.js';
import {type CartItem, createCartKey} from './headless-cart.js';

export function itemSelector(cartState: CartState, item: CartItem) {
  return cartState.cart[createCartKey(item)];
}

export const totalQuantitySelector = createSelector(itemsSelector, (items) =>
  items.reduce((prev, cur) => prev + cur.quantity, 0)
);

export const totalPriceSelector = createSelector(itemsSelector, (items) =>
  items.reduce((prev, cur) => prev + cur.price * cur.quantity, 0)
);
