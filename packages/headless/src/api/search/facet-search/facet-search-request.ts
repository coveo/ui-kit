import {SearchRequest} from '../search/search-request';

export interface FacetSearchRequest {
  field: string;
  captions: Record<string, string>;
  ignoreValues: string[];
  numberOfValues: number;
  query: string;
  searchContext: SearchRequest;
  delimitingCharacter: string;
}

export interface FacetSearchType<T extends 'specific' | 'hierarchical'> {
  type: T;
}
