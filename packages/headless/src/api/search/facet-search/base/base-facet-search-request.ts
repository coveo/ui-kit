import {BaseParam} from '../../search-api-params';
import {SearchRequest} from '../../search/search-request';

export interface FacetSearchRequestOptions {
  /** A dictionary that maps index field values to facet value display names. */
  captions: Record<string, string>;
  /** The maximum number of values to fetch.
   * @default 10
   */
  numberOfValues: number;
  /** The string to match.*/
  query: string;
}

export interface BaseFacetSearchRequest
  extends FacetSearchRequestOptions,
    BaseParam {
  field: string;
  searchContext: SearchRequest;
  delimitingCharacter: string;
}

export interface FacetSearchType<T extends 'specific' | 'hierarchical'> {
  type: T;
}
