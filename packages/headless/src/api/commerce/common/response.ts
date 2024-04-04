import {AnyFacetResponse} from '../../../features/commerce/facets/facet-set/interfaces/response';
import {
  SearchAPIErrorWithExceptionInBody,
  SearchAPIErrorWithStatusCode,
} from '../../search/search-api-error-response';
import {Pagination} from './pagination';
import {Product} from './product';
import {Sort} from './sort';

export interface BaseCommerceSuccessResponse {
  responseId: string;
  products: Product[];
  pagination: Pagination;
}

export interface CommerceSuccessResponse extends BaseCommerceSuccessResponse {
  facets: AnyFacetResponse[];
  sort: Sort;
}

export type CommerceResponse =
  | CommerceSuccessResponse
  | SearchAPIErrorWithExceptionInBody
  | SearchAPIErrorWithStatusCode;
