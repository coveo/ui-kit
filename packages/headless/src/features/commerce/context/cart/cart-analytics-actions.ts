import {
  CurrencyCodeISO4217,
  Ec,
  ProductQuantity,
} from '@coveo/relay-event-types';
import {CartItem} from '../../../../controllers/commerce/context/cart/headless-cart';
import {
  itemSelector,
  itemsSelector,
} from '../../../../controllers/commerce/context/cart/headless-cart-selectors';
import {
  CartAction,
  makeAnalyticsAction,
} from '../../../analytics/analytics-utils';
import {CartItemWithMetadata} from './cart-state';

export interface Transaction {
  id: string;
  revenue: number;
}

export const logCartAction = (item: CartItem): CartAction =>
  makeAnalyticsAction({
    prefix: 'analytics/cart/cartAction',
    __legacy__getBuilder: (_client, _state) => null,
    analyticsType: 'ec.cartAction',
    analyticsPayloadBuilder: (state): Ec.CartAction => {
      const prevItem = itemSelector(state.cart, item.productId);
      const action = isCurrentItemQuantityGreater(item, prevItem)
        ? 'add'
        : 'remove';
      const {quantity, ...product} = item;
      const currency =
        state.commerceContext.currency.toUpperCase() as CurrencyCodeISO4217;
      return {
        action,
        currency,
        quantity: 1,
        product,
      };
    },
  });
};

export const logCartPurchase = (transaction: Transaction): CartAction =>
  makeAnalyticsAction({
    prefix: 'analytics/cart/purchase',
    __legacy__getBuilder: (_client, _state) => null,
    analyticsType: 'ec.purchase',
    analyticsPayloadBuilder: (state): Ec.Purchase => {
      // @todo LENS-1589: currently, the currency attribute should be a string. However, the type should be CurrencyCodeISO4217
      const currency = state.commerceContext.currency as CurrencyCodeISO4217;
      const products = itemsSelector(state.cart).map((item) =>
        convertCartItemToProductQuantity(item)
      );
      return {
        currency,
        products,
        transaction,
      };
    },
  });

const convertCartItemToProductQuantity = (
  item: CartItemWithMetadata
): ProductQuantity => {
  const {quantity, ...product} = item;
  return {product, quantity};
};

const isCurrentItemQuantityGreater = (
  currentItem: CartItem,
  prevItem: CartItemWithMetadata | undefined
) {
  if (!prevItem) {
    return true;
  }

  return currentItem.quantity > prevItem.quantity;
}
