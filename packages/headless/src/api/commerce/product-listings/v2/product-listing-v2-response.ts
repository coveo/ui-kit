import {AnyFacetResponse} from '../../../../features/facets/generic/interfaces/generic-facet-response';
import {SortCriterion} from '../../../../features/sort/sort';
import {
  SearchAPIErrorWithExceptionInBody,
  SearchAPIErrorWithStatusCode,
} from '../../../search/search-api-error-response';
import {ProductRecommendation} from '../../../search/search/product-recommendation';

export interface ProductListingV2SuccessResponse {
  responseId: string;
  products: ProductRecommendation[];
  facets: AnyFacetResponse[];
  pagination: ProductListingV2Pagination;
  sort: ProductListingV2Sort;
}

export interface ProductListingV2Pagination {
  page: number;
  perPage: number;
  totalCount: number;
  totalPages: number;
}

export interface ProductListingV2Sort {
  appliedSort: SortCriterion;
  availableSorts: SortCriterion[];
}

export type ProductListingV2 =
  | ProductListingV2SuccessResponse
  | SearchAPIErrorWithExceptionInBody
  | SearchAPIErrorWithStatusCode;
