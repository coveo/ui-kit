import {SearchRequest} from '../../search/search-request';

export interface BaseFacetSearchRequest {
  field: string;
  captions: Record<string, string>;
  numberOfValues: number;
  query: string;
  searchContext: SearchRequest;
  delimitingCharacter: string;
}

export interface FacetSearchType<T extends 'specific' | 'hierarchical'> {
  type: T;
}
