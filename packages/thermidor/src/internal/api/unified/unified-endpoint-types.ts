// ─── Commerce agent input ──────────────────────────────────────────────────

export interface CommerceRequestModel {
  trackingId: string;
  language: string;
  country: string;
  currency: string;
  clientId?: string;
  message: string | null;
  action: A2uiAction | null;
  conversationSessionId?: string;
  conversationToken?: string;
  context: CommerceRequestContext;
  /**
   * Present only when the consumer supplies a `commerceContextProvider`
   * (ADR-012). Omitted entirely under the "absent" encoding so the router can
   * distinguish "no commerce context" from a present-but-empty context.
   */
  pinnedProducts?: string[];
}

interface CommerceRequestContext {
  view: {url: string | null; referrer: string | null};
  user: Record<string, unknown>;
  cart: CommerceCartItem[];
  /**
   * Present only under the "present" commerce-context encoding (ADR-012).
   * Omitted under the "absent" encoding.
   */
  source?: string[];
  /**
   * Present only under the "present" commerce-context encoding (ADR-012).
   * Omitted under the "absent" encoding.
   */
  custom?: Record<string, unknown>;
}

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

// ─── Action envelope ───────────────────────────────────────────────────────

export interface A2uiAction<TContext = unknown> {
  surfaceId: string | null;
  name: string;
  sourceComponentId: string;
  timestamp: string;
  actionId: string | null;
  wantResponse: boolean;
  context: TContext;
}
