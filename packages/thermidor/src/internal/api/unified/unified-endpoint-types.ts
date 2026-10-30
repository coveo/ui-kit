import type {CommerceCartItem} from '@/src/internal/context/commerce-context.js';

// ─── Commerce agent input ──────────────────────────────────────────────────

export interface CommerceRequestModel {
  agentConfigurationId: string;
  trackingId: string;
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
}

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
  context: TContext;
}

/** Opens the session. No component exists yet, so it names no surface or source component. */
export interface InitializeAction {
  name: 'initialize';
  timestamp: string;
  actionId: null;
  wantResponse: false;
  context: Record<string, never>;
}
