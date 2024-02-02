import {CartItemParam} from '../../../../api/commerce/commerce-api-params';

/**
 * Additional cart item metadata required for logging analytics events.
 */
export interface CartItemMetadata {
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
  cart: Record<string, CartItemParam & CartItemMetadata>;
}

export const getCartInitialState = (): CartState => ({
  cartItems: [],
  cart: {},
});
