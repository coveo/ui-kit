import {AnyFacetResponse} from '../../../../features/facets/generic/interfaces/generic-facet-response.js';
import {
  SearchAPIErrorWithExceptionInBody,
  SearchAPIErrorWithStatusCode,
} from '../../../search/search-api-error-response.js';
import {ProductRecommendation} from '../../../search/search/product-recommendation.js';
import {Pagination} from './pagination.js';
import {Sort} from './sort.js';

export interface ProductListingV2SuccessResponse {
  responseId: string;
  products: ProductRecommendation[];
  facets: AnyFacetResponse[];
  pagination: Pagination;
  sort: Sort;
}

export type ProductListingV2 =
  | ProductListingV2SuccessResponse
  | SearchAPIErrorWithExceptionInBody
  | SearchAPIErrorWithStatusCode;
