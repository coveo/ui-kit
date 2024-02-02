import {CartItemParam} from '../../../../api/commerce/commerce-api-params';
import {
  CartItemMetadata,
  CartState,
} from '../../../../features/commerce/context/cart/cart-state';

export function itemSelector(cartState: CartState, productId: string) {
  return cartState.cart[productId];
}

export function itemsSelector(
  cartState: CartState
): (CartItemParam & CartItemMetadata)[] {
  const {cart, cartItems} = cartState;

  return cartItems.map((id: string) => cart[id]);
}

export function totalQuantitySelector(cartState: CartState): number {
  const items = itemsSelector(cartState);

  return items.reduce((prev, cur) => prev + cur.quantity, 0);
}

export function totalPriceSelector(cartState: CartState): number {
  const items = itemsSelector(cartState);

  return items.reduce((prev, cur) => prev + cur.price * cur.quantity, 0);
}
