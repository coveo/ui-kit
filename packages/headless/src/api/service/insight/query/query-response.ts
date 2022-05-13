// TODO: Add interface with flesh to it
export interface InsightQueryResponse {
  results: SearchResult[];
  searchUid: string;
  totalCount: number;
  executionReport?: Record<string, unknown>;
  facets: Facet[];
}

interface SearchResult {
  title: string;
  clickUri: string;
  excerpt: string;
  fields: Record<string, string | number | string[]>; // TODO: make sure those types are correct
  uniqueId: string;
  hasHtmlVersion: boolean;
  percentScore: number;
}

interface Facet {
  field: string;
  moreValuesAvailable: boolean;
  values: FacetValue[];
  indexScore: number;
}

interface FacetValue {
  value: string;
  state: string;
  numberOfResults: number;
}
