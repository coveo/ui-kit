import {
  SearchAPIErrorWithExceptionInBody,
  SearchAPIErrorWithStatusCode,
} from '../../../search/search-api-error-response';
import {ProductRecommendation} from '../../../search/search/product-recommendation';
import {Pagination} from './pagination';
import {Sort} from './sort';
import {AnyFacetResponse} from './facet';

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
