export interface BaseFacetResponse<T> {
  facetId: string;
  field: string;
  moreValuesAvailable: boolean;
  values: T[];
  indexScore: number;
}
