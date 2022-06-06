import {AnyFacetResponse} from '../../../../features/facets/generic/interfaces/generic-facet-response';

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
