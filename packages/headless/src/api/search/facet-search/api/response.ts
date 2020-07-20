export interface FacetSearchResult {
  displayValue: string;
  rawValue: string;
  count: number;
}

export interface FacetSearchResponse {
  values: FacetSearchResult[];
  moreValuesAvailable: boolean;
}
