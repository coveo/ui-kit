import type {Ec} from '@coveo/relay-event-types';
import {createSelector} from '@reduxjs/toolkit';
import type {CommerceEngineState} from '../../../../app/commerce-engine/commerce-engine.js';
import type {CartKey} from '../../../../controllers/commerce/context/cart/headless-cart.js';
import {getCurrency} from '../context-selector.js';
import type {CartState} from './cart-state.js';

/**
 * The purchase transaction.
 */
export interface Transaction {
  /**
   * The transaction's id
   */
  id: string;

  /**
   * The total revenue from the transaction, including taxes, shipping, and discounts.
   */
  revenue: number;
}

export const getECPurchasePayload = (
  transaction: Transaction,
  state: CommerceEngineState
): Ec.Purchase => ({
  currency: getCurrency(state.commerceContext),
  products: productQuantitySelector(state.cart),
  transaction,
});

export interface CartActionDetails extends Omit<Ec.CartAction, 'currency'> {}

export const getECCartActionPayload = (
  cartActionDetails: CartActionDetails,
  state: CommerceEngineState
): Ec.CartAction => ({
  currency: getCurrency(state.commerceContext),
  ...cartActionDetails,
});

export const itemsSelector = createSelector(
  (cartState: CartState) => cartState.cart,
  (cartState: CartState) => cartState.cartItems,
  (cart, cartItems) => cartItems.map((key: CartKey) => cart[key])
);

const productQuantitySelector = createSelector(itemsSelector, (items) =>
  items.map(({quantity, ...product}) => ({
    quantity,
    product,
  }))
);
