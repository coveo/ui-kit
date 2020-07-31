import {FacetValueState} from './value';

export interface BaseFacetRequest {
  facetId: string;
  field: string;
  filterFacetCount: boolean;
  injectionDepth: number;
  numberOfValues: number;
  preventAutoSelect: boolean;
}

export interface BaseFacetValueRequest {
  state: FacetValueState;
}

export interface CurrentValues<T> {
  currentValues: T[];
}

export interface Freezable {
  freezeCurrentValues: boolean;
}

export interface Delimitable {
  delimitingCharacter: string;
}

export interface Expandable {
  isFieldExpanded: boolean;
}

export interface Type<
  T extends 'specific' | 'dateRange' | 'numericalRange' | 'hierarchical'
> {
  type: T;
}

export interface SortCriteria<
  T extends
    | 'score'
    | 'alphanumeric'
    | 'ascending'
    | 'descending'
    | 'occurrences'
    | 'automatic'
> {
  sortCriteria: T;
}
