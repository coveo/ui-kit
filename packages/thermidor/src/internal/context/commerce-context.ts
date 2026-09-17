/**
 * App-owned commerce context — one of the client-owned context inputs a
 * consumer supplies through a pull-based provider on `SessionConfig` (ADR-012).
 * The request builder reads it fresh per request and maps it onto the wire
 * request; it is never stored on the session and never serialized.
 */

/**
 * A single cart line item carried by the app-owned commerce context (ADR-012).
 */
export interface CommerceCartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

/**
 * The app-owned commerce context a consumer supplies through
 * `commerceContextProvider` (ADR-012). The request builder reads it fresh per
 * request and maps it onto the wire request. `cart` is required (an empty cart
 * is a meaningful "present-but-empty" signal); the remaining fields are
 * optional and, when supplied, are carried on the wire as the "present"
 * encoding — distinguishable from the "absent" encoding sent when no provider
 * is configured.
 */
export interface CommerceContext {
  cart: CommerceCartItem[];
  pinnedProducts?: string[];
  source?: string[];
  custom?: Record<string, unknown>;
}

/**
 * The pull-based provider a consumer supplies for app-owned
 * {@link CommerceContext} (ADR-012). Synchronous by design: the request builder
 * calls it fresh per request.
 */
export type CommerceContextProvider = () => CommerceContext;
