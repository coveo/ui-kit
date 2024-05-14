import {Ec} from '@coveo/relay-event-types';
import {createSelector} from '@reduxjs/toolkit';
import {CommerceEngineState} from '../../../../app/commerce-engine/commerce-engine';
import {CartKey} from '../../../../controllers/commerce/context/cart/headless-cart';
import {getCurrency} from '../context-selector';
import {CartState} from './cart-state';
import {CartItemWithMetadata} from './cart-state';

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

export const itemsSelector = createSelector(
  (cartState: CartState) => cartState.cart,
  (cartState: CartState) => cartState.cartItems,
  (cart, cartItems) =>
    cartItems.flatMap((key: CartKey) => {
      return Object.entries(cart[key]).reduce((acc, [_, item]) => {
        acc.push(item);
        return acc;
      }, [] as CartItemWithMetadata[]);
    })
);

const productQuantitySelector = createSelector(itemsSelector, (items) =>
  items.map(({quantity, ...product}) => ({
    quantity,
    product,
  }))
);
