export interface CoveoConversationCartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

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
    cart?: CoveoConversationCartItem[];
  };
  conversationSessionId?: string;
  conversationToken?: string;
  targetEngine: 'AGENT_CORE';
}

export interface CoveoConversationEndpointResponse {
  stream: ReadableStream<Uint8Array>;
}
