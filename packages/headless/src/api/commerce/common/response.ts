import {AnyFacetResponse} from '../../../features/commerce/facets/facet-set/interfaces/response';
import {
  SearchAPIErrorWithExceptionInBody,
  SearchAPIErrorWithStatusCode,
} from '../../search/search-api-error-response';
import {ProductRecommendation} from '../../search/search/product-recommendation';
import {Pagination} from './pagination';
import {Sort} from './sort';

export interface CommerceSuccessResponse {
  responseId: string;
  products: ProductRecommendation[];
  facets: AnyFacetResponse[];
  pagination: Pagination;
  sort: Sort;
}

export type CommerceResponse =
  | CommerceSuccessResponse
  | SearchAPIErrorWithExceptionInBody
  | SearchAPIErrorWithStatusCode;
