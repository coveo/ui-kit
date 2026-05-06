/**
 * Cart Feature Types
 */

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
}

export interface CartItemParam {
  productId: string;
  quantity: number;
}

export const getProductsFromCartState = (state: CartState): CartItemParam[] => {
  const aggregated = state.items.reduce(
    (acc, item) => {
      if (!(item.productId in acc)) {
        acc[item.productId] = {productId: item.productId, quantity: 0};
      }
      acc[item.productId].quantity += item.quantity;
      return acc;
    },
    {} as Record<string, CartItemParam>
  );

  return Object.values(aggregated);
};
