export type {
  CoveoSearchEndpointRequest,
  CoveoFacetRequest,
  CoveoSearchEndpointResponse,
  CoveoFacetResponse,
  CoveoFacetValue,
  CoveoSearchResult,
} from '@/src/api/interface/search-endpoint/search-endpoint-types.js';

export type {
  CoveoConversationEndpointRequest,
  CoveoConversationEndpointResponse,
} from '@/src/api/interface/conversation-endpoint/conversation-endpoint-types.js';

export type {
  SearchEndpointClient,
  SearchEndpointClientConfiguration,
  SearchEndpointClientResult,
} from '@/src/api/interface/search-endpoint/search-endpoint-client.js';

export type {
  ConversationEndpointClient,
  ConversationEndpointClientConfiguration,
  ConversationEndpointCallOptions,
  ConversationEndpointClientResult,
} from '@/src/api/interface/conversation-endpoint/conversation-endpoint-client.js';

export {createSearchEndpointClient} from '@/src/api/interface/search-endpoint/search-endpoint-client.js';
export {createConversationEndpointClient} from '@/src/api/interface/conversation-endpoint/conversation-endpoint-client.js';
