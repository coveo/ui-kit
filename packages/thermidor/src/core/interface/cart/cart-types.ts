/**
 * ============================================================================
 * Domain types (for state / selectors)
 * ============================================================================
 */

export interface CartItem {
  /**
   * The unique product identifier.
   */
  productId: string;

  /**
   * The display name of the product.
   */
  name: string;

  /**
   * The unit price of the product.
   */
  price: number;

  /**
   * The quantity of this product in the cart.
   */
  quantity: number;
}

export interface CartState {
  /**
   * The list of items currently in the cart.
   */
  items: CartItem[];
}

/**
 * ============================================================================
 * Operation types (for mutations / actions)
 * ============================================================================
 */

export interface SetCartItemsPayload {
  /**
   * The items to set in the cart.
   */
  items: CartItem[];
}

export interface UpdateItemQuantityPayload {
  /**
   * The item with updated quantity.
   */
  item: CartItem;
}
