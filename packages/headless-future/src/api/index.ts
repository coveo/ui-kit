export type {
  CoveoSearchEndpointRequest,
  CoveoFacetRequest,
  CoveoSearchEndpointResponse,
  CoveoFacetResponse,
  CoveoFacetValue,
  CoveoSearchResult,
} from '@/src/api/interface/search-endpoint/search-endpoint-types.js';

export type {
  SearchEndpointClient,
  SearchEndpointClientConfiguration,
  SearchEndpointClientResult,
} from '@/src/api/interface/search-endpoint/search-endpoint-client.js';

export {createSearchEndpointClient} from '@/src/api/interface/search-endpoint/search-endpoint-client.js';
