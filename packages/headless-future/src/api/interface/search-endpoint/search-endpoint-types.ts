export interface CoveoSearchEndpointRequest {
  q?: string;
  aq?: string;
  cq?: string;
  numberOfResults?: number;
  firstResult?: number;
  fieldsToInclude?: string[];
  enableDidYouMean?: boolean;
  facets?: CoveoFacetRequest[];
}

export interface CoveoFacetRequest {
  facetId: string;
  field: string;
  type?: 'specific' | 'date' | 'numeric';
  numberOfValues?: number;
  currentValues?: Array<{value: string; state: 'selected' | 'idle'}>;
}

export interface CoveoSearchEndpointResponse {
  totalCount: number;
  results: CoveoSearchResult[];
  facets?: CoveoFacetResponse[];
  duration?: number;
  queryCorrections?: Array<{
    correctedQuery: string;
    wordCorrections: unknown[];
  }>;
}

export interface CoveoSearchResult {
  uniqueId: string;
  title: string;
  uri: string;
  excerpt?: string;
  printableUri?: string;
  clickUri?: string;
  raw?: Record<string, unknown>;
  score?: number;
}

export interface CoveoFacetResponse {
  facetId: string;
  field: string;
  values: CoveoFacetValue[];
}

export interface CoveoFacetValue {
  value: string;
  numberOfResults: number;
  state?: 'selected' | 'idle';
}
