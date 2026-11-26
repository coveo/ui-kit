/**
 * App-owned commerce context — one of the client-owned context inputs a
 * consumer supplies through a pull-based provider on `SessionConfig`. The
 * request builder reads it fresh per request and maps it onto the wire request;
 * it is never stored on the session and never serialized.
 */

/**
 * A single cart line of the {@link CommerceContext}.
 *
 * @group Context
 */
export interface CommerceCartItem {
  /** The unique identifier of the product. */
  productId: string;
  /** The human-readable name of the product. */
  name: string;
  /** The price per unit of the product. */
  price: number;
  /** The number of units of the product in the cart. */
  quantity: number;
}

/**
 * The app's commerce context, returned by the {@link SessionConfig.commerceContextProvider} the
 * consumer supplies.
 *
 * @remarks
 * - The session reads it before every request and sends it with the request. It never keeps it
 *   and never serializes it.
 * - `cart` is required: an empty cart still tells the endpoint the shopper has none, which a
 *   session without a provider can't.
 *
 * @group Context
 */
export interface CommerceContext {
  /** The shopper's current cart. An empty array is sent as an empty cart. */
  cart: CommerceCartItem[];
  /**
   * The ids of the products to send as the request's pinned products.
   *
   * @defaultValue `[]`
   */
  pinnedProducts?: string[];
  /**
   * The sources to send in the request's context.
   *
   * @defaultValue `[]`
   */
  source?: string[];
  /**
   * Custom context values to send with the request.
   *
   * @defaultValue `{}`
   */
  custom?: Record<string, unknown>;
}

/**
 * A synchronous function that returns the current {@link CommerceContext}. The session calls it
 * before every request.
 *
 * @group Context
 */
export type CommerceContextProvider = () => CommerceContext;
