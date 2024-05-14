import {createSelector} from '@reduxjs/toolkit';
import {itemsSelector} from '../../../../features/commerce/context/cart/cart-selector';
import {CartState} from '../../../../features/commerce/context/cart/cart-state';
import {CartItem, createCartKey} from './headless-cart';

export function itemSelector(cartState: CartState, cartItem: CartItem) {
  return Object.entries(cartState.cart[createCartKey(cartItem)])
    .filter(([_, item]) => item.price === cartItem.price)
    .map(([_, item]) => item)[0];
}

export const totalQuantitySelector = createSelector(itemsSelector, (items) =>
  items.reduce((prev, cur) => prev + cur.quantity, 0)
);

export const totalPriceSelector = createSelector(itemsSelector, (items) =>
  items.reduce((prev, cur) => prev + cur.price * cur.quantity, 0)
);
