export interface InsightQueryResponse {
  results: SearchResult[];
  searchUid: string;
  totalCount: number;
  executionReport?: Record<string, unknown>;
  facets: AnyFacetResponse[];
}

export interface SearchResult {
  title: string;
  clickUri: string;
  excerpt: string;
  fields: Record<string, string | boolean | number | string[]>;
  uniqueId: string;
  hasHtmlVersion: boolean;
  percentScore: number;
}

export interface AnyFacetResponse {
  field: string;
  moreValuesAvailable: boolean;
  values: FacetValue[];
  indexScore: number;
}

export interface FacetValue {
  value: string;
  state: string;
  numberOfResults: number;
}
