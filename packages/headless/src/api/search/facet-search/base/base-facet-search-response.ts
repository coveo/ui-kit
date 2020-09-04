export interface BaseFacetSearchResult {
  displayValue: string;
  rawValue: string;
  count: number;
}

export interface BaseFacetSearchResponse<T extends BaseFacetSearchResult> {
  values: T[];
  moreValuesAvailable: boolean;
}
