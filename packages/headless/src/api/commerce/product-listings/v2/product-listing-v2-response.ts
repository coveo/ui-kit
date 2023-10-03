import {
  SearchAPIErrorWithExceptionInBody,
  SearchAPIErrorWithStatusCode,
} from '../../../search/search-api-error-response';
import {ProductRecommendation} from '../../../search/search/product-recommendation';
import {CommerceFacetResponse} from './facet';
import {Pagination} from './pagination';
import {Sort} from './sort';

export interface ProductListingV2SuccessResponse {
  responseId: string;
  products: ProductRecommendation[];
  facets: CommerceFacetResponse[];
  pagination: Pagination;
  sort: Sort;
}

export type ProductListingV2 =
  | ProductListingV2SuccessResponse
  | SearchAPIErrorWithExceptionInBody
  | SearchAPIErrorWithStatusCode;
