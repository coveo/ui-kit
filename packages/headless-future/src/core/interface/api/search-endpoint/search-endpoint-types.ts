export type SearchEndpointStatus = 'idle' | 'pending';

export interface SearchEndpointState {
  configuration: Record<string, any>;
  status: SearchEndpointStatus;
  error: string | null;
}

export type {
  CoveoSearchEndpointRequest,
  CoveoFacetRequest,
  CoveoSearchEndpointResponse,
  CoveoFacetResponse,
  CoveoFacetValue,
  CoveoSearchResult,
} from '@/src/api/index.js';
