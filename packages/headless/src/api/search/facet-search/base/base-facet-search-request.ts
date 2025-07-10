import type {BaseParam} from '../../../platform-service-params.js';
import type {SearchRequest} from '../../search/search-request.js';
import type {AuthenticationParam} from '../../search-api-params.js';

export interface FacetSearchRequestOptions {
  /** A dictionary that maps index field values to facet value display names. */
  captions: Record<string, string>;
  /** The maximum number of values to fetch.
   * @defaultValue `10`
   */
  numberOfValues: number;
  /** The string to match.*/
  query: string;
}

export interface BaseFacetSearchRequest
  extends FacetSearchRequestOptions,
    BaseParam,
    AuthenticationParam {
  field: string;
  searchContext?: SearchRequest;
  filterFacetCount: boolean;
}

export interface FacetSearchType<T extends 'specific' | 'hierarchical'> {
  type: T;
}
