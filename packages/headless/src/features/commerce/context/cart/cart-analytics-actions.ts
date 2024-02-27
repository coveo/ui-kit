import {CurrencyCodeISO4217, Ec} from '@coveo/relay-event-types';
import {CartItem} from '../../../../controllers/commerce/context/cart/headless-cart';
import {itemSelector} from '../../../../controllers/commerce/context/cart/headless-cart-selectors';
import {
  CartAction,
  makeAnalyticsAction,
} from '../../../analytics/analytics-utils';
import {CartItemWithMetadata} from './cart-state';

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

      // @todo LENS-1589: currently, the currency attribute should be a string. However, the type should be CurrencyCodeISO4217
      const currency = state.commerceContext.currency as CurrencyCodeISO4217;
      return {
        action,
        currency,
        quantity: getQuantity(item, prevItem),
        product,
      };
    },
  });

const isCurrentItemQuantityGreater = (
  currentItem: CartItem,
  prevItem: CartItemWithMetadata | undefined
): boolean => !prevItem || currentItem.quantity > prevItem.quantity;

const getQuantity = (
  currentItem: CartItem,
  prevItem: CartItemWithMetadata | undefined
): number =>
  !prevItem
    ? currentItem.quantity
    : Math.abs(currentItem.quantity - prevItem.quantity);
