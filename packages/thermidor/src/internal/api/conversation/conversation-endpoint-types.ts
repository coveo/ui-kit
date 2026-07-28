import type {CommerceSearchSortCriterion} from '@/src/internal/api/commerce-search/index.js';

export interface CoveoConversationCartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CoveoConversationEndpointRequestBase {
  trackingId?: string;
  language?: string;
  country?: string;
  currency?: string;
  clientId?: string;
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

export interface CoveoConversationMessageRequest extends CoveoConversationEndpointRequestBase {
  message: string;
}

/**
 * A schema-derived mutation for one server-owned controller state entry.
 * `controllerSchema` identifies the generated contract that defines `action`
 * and validates `payload`; `controllerId` identifies its runtime snapshot key.
 */
export interface CoveoConversationControllerAction {
  controllerId: string;
  controllerSchema: string;
  action: string;
  payload: unknown;
}

export interface CoveoConversationActionRequest extends CoveoConversationEndpointRequestBase {
  action: CoveoConversationControllerAction;
}

export type CoveoConversationEndpointRequest =
  | CoveoConversationMessageRequest
  | CoveoConversationActionRequest;

export interface CoveoConversationEndpointResponse {
  stream: ReadableStream<Uint8Array>;
}
