import {CartItemParam} from '../../../../api/commerce/commerce-api-params';

export interface CartState {
  cartItems: string[];
  cart: Record<string, CartItemParam>;
}

export const getCartInitialState = (): CartState => ({
  cartItems: [],
  cart: {},
});
