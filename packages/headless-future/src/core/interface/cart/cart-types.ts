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

/**
 * Represents the normalized cart state, tracking all items added by the user.
 */
export interface CartState {
  /**
   * The list of items currently in the cart.
   */
  items: CartItem[];
}

/**
 * ============================================================================
 * Mutation payloads (for extensibility)
 * ============================================================================
 */

/**
 * Payload for replacing all items in the cart.
 */
export interface SetCartItemsPayload {
  /**
   * The items to set in the cart.
   */
  items: CartItem[];
}

/**
 * Payload for updating the quantity of a cart item.
 */
export interface UpdateItemQuantityPayload {
  /**
   * The item with updated quantity.
   */
  item: CartItem;
}
