import {CartItemParam} from '../../../../api/commerce/commerce-api-params';

export interface CartItemWithMetadata extends CartItemParam {
  /**
   * The name of the cart item.
   */
  name: string;
  /**
   * The price of the cart item.
   */
  price: number;
}

export interface CartState {
  cartItems: string[];
  cart: Record<string, CartItemWithMetadata>;
}

export const getCartInitialState = (): CartState => ({
  cartItems: [],
  cart: {},
});

export function getProductsFromCartState(state: CartState): CartItemParam[] {
  const itemMap = state.cartItems.reduce(
    (acc, key) => {
      const {productId, quantity} = state.cart[key];
      if (!(productId in acc)) {
        acc[productId] = {
          productId,
          0
        };
      }
      acc[productId].quantity += quantity;

      return acc;
    },
    {} as Record<string, CartItemParam>
  );

  return [...Object.values(itemMap)];
}
