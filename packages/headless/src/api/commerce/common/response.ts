import {AnyFacetResponse} from '../../../features/commerce/facets/facet-set/interfaces/response';
import {
  SearchAPIErrorWithExceptionInBody,
  SearchAPIErrorWithStatusCode,
} from '../../search/search-api-error-response';
import {Pagination} from './pagination';
import {Product} from './product';
import {Sort} from './sort';

export interface CommerceSuccessResponse {
  responseId: string;
  products: Product[];
  facets: AnyFacetResponse[];
  pagination: Pagination;
  sort: Sort;
}

export type CommerceResponse =
  | CommerceSuccessResponse
  | SearchAPIErrorWithExceptionInBody
  | SearchAPIErrorWithStatusCode;
