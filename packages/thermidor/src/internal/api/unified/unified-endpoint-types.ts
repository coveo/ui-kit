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
  pinnedProducts: string[];
}

interface CommerceRequestContext {
  view: {url: string | null; referrer: string | null};
  user: Record<string, unknown>;
  cart: CommerceCartItem[];
  source: string[];
  custom: Record<string, unknown>;
}

interface CommerceCartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
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
