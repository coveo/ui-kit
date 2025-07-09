import type {CartItemParam} from '../../../../api/commerce/commerce-api-params.js';

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
  purchasedItems: string[];
  purchased: Record<string, CartItemWithMetadata>;
}

export const getCartInitialState = (): CartState => ({
  cartItems: [],
  cart: {},
  purchasedItems: [],
  purchased: {},
});

export const getProductsFromCartState = (state: CartState): CartItemParam[] =>
  getProductsFromCart(state.cartItems, state.cart);
export const getProductsFromCartPurchasedState = (
  state: CartState
): CartItemParam[] =>
  getProductsFromCart(state.purchasedItems, state.purchased);

function getProductsFromCart(
  items: string[],
  itemMap: Record<string, CartItemWithMetadata>
) {
  const productsMap = items.reduce(
    (acc, key) => {
      const {productId, quantity} = itemMap[key];
      if (!(productId in acc)) {
        acc[productId] = {
          productId,
          quantity: 0,
        };
      }
      acc[productId].quantity += quantity;

      return acc;
    },
    {} as Record<string, CartItemParam>
  );

  return [...Object.values(productsMap)];
}
