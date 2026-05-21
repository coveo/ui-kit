import type {CartItem} from '@/src/core/interface/cart/cart-types.js';

export interface CoveoConversationEndpointRequest {
  trackingId?: string;
  language?: string;
  country?: string;
  currency?: string;
  clientId?: string;
  message: string;
  context: {
    user: {
      userAgent?: string | null;
    };
    view: {
      url?: string | null;
      referrer?: string | null;
    };
    cart?: {
      items: CartItem[];
    };
  };
  conversationSessionId?: string;
  conversationToken?: string;
  targetEngine: 'AGENT_CORE';
}

export interface CoveoConversationEndpointResponse {
  stream: ReadableStream<Uint8Array>;
}
