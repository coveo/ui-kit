import {CartItemParam} from '../../../../api/commerce/commerce-api-params';

export interface CartItemWithMetadata extends CartItemParam {
  /**
   * The product unique identifier of the cart item.
   */
  productId: string;
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
