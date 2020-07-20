import {SearchRequest} from '../../search/search-request';

export interface BaseFacetSearchRequest {
  field: string;
  captions: Record<string, string>;
  ignoreValues: string[];
  numberOfValues: number;
  query: string;
  searchContext: SearchRequest;
  delimitingCharacter: string;
}

export interface Type<T extends 'specific' | 'hierarchical'> {
  type: T;
}
