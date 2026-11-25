/**
 * App-owned commerce context — one of the client-owned context inputs a
 * consumer supplies through a pull-based provider on `SessionConfig`. The
 * request builder reads it fresh per request and maps it onto the wire request;
 * it is never stored on the session and never serialized.
 */

/**
 * A single cart line item carried by the app-owned commerce context.
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
 * The app-owned commerce context a consumer supplies through
 * `commerceContextProvider`. The request builder reads it fresh per request and
 * maps it onto the wire request. `cart` is required (an empty cart
 * is a meaningful "present-but-empty" signal); the remaining fields are
 * optional and, when supplied, are carried on the wire as the "present"
 * encoding — distinguishable from the "absent" encoding sent when no provider
 * is configured.
 */
export interface CommerceContext {
  /** The shopper's current cart. An empty array is sent as an empty cart. */
  cart: CommerceCartItem[];
  /** The ids of the products to send as the request's pinned products. Defaults to `[]`. */
  pinnedProducts?: string[];
  /** The sources to send in the request's context. Defaults to `[]`. */
  source?: string[];
  /** Custom context values to send with the request. Defaults to `{}`. */
  custom?: Record<string, unknown>;
}

/**
 * The pull-based provider a consumer supplies for app-owned
 * {@link CommerceContext}. Synchronous by design: the request builder calls it
 * fresh per request.
 */
export type CommerceContextProvider = () => CommerceContext;
