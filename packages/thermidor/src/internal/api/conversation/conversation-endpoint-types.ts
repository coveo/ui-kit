import type {CommerceSearchSortCriterion} from '@/src/internal/api/commerce-search/index.js';

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
  page?: number;
  perPage?: number;
  sort?: CommerceSearchSortCriterion[];
  facets?: Array<{facetId: string; selectedValues: string[]}>;
}

export interface CoveoConversationEndpointResponse {
  stream: ReadableStream<Uint8Array>;
}
