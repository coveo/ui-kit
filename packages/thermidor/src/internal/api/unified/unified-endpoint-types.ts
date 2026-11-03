import type {CommerceCartItem} from '@/src/internal/context/commerce-context.js';

// ─── Commerce agent input ──────────────────────────────────────────────────

/**
 * The request keys the session builds itself on every request. A request
 * contract supplies every other key, and can't set these.
 */
export type ClientOwnedRequestFields = {
  clientId?: string;
  message: string | null;
  action: A2uiAction | InitializeAction | null;
  conversationSessionId?: string;
  conversationToken?: string;
  context: CommerceRequestContext;
  /**
   * Present only when the consumer supplies a `commerceContextProvider`.
   * Omitted entirely under the "absent" encoding so the router can distinguish
   * "no commerce context" from a present-but-empty context.
   */
  pinnedProducts?: string[];
};

/** Every key of {@link ClientOwnedRequestFields}, checked against the type. */
export const CLIENT_OWNED_REQUEST_KEYS = [
  'clientId',
  'message',
  'action',
  'conversationSessionId',
  'conversationToken',
  'context',
  'pinnedProducts',
] as const satisfies readonly (keyof ClientOwnedRequestFields)[];

/** The fields the built-in request contract of the public `createSession` sends. */
export type BuiltInRequestFields = {
  agentConfigurationId: string;
  trackingId: string;
};

/** The request of the public `createSession`: the client-owned keys plus the built-in contract. */
export type CommerceRequestModel = ClientOwnedRequestFields & BuiltInRequestFields;

/**
 * Any converse request: the client-owned keys plus the fields of the session's
 * request contract, built-in or injected.
 */
export type ConverseRequestModel = ClientOwnedRequestFields & {[key: string]: unknown};

interface CommerceRequestContext {
  view: {url: string | null; referrer: string | null};
  user: Record<string, unknown>;
  cart: CommerceCartItem[];
  /**
   * Present only under the "present" commerce-context encoding; omitted under
   * the "absent" encoding.
   */
  source?: string[];
  /**
   * Present only under the "present" commerce-context encoding; omitted under
   * the "absent" encoding.
   */
  custom?: Record<string, unknown>;
}

// ─── Action envelope ───────────────────────────────────────────────────────

export interface A2uiAction<TContext = unknown> {
  surfaceId: string | null;
  name: string;
  sourceComponentId: string;
  timestamp: string;
  /** Sent as `null` when the session retries an action that opened a turn. */
  actionId?: null;
  /** Sent as `false` when the session retries an action that opened a turn. */
  wantResponse?: false;
  context: TContext;
}

/** Opens the session. No component exists yet, so it names no surface or source component. */
export interface InitializeAction {
  name: 'initialize';
  timestamp: string;
  context: Record<string, never>;
}
