import {AnyFacetResponse} from '../../../features/commerce/facets/facet-set/interfaces/response';
import {Trigger} from '../../common/trigger';
import {
  SearchAPIErrorWithExceptionInBody,
  SearchAPIErrorWithStatusCode,
} from '../../search/search-api-error-response';
import {Pagination} from './pagination';
import {RawProduct} from './product';
import {Sort} from './sort';

export interface BaseCommerceSuccessResponse {
  responseId: string;
  products: RawProduct[];
  pagination: Pagination;
  triggers: Trigger[];
}

export interface CommerceSuccessResponse extends BaseCommerceSuccessResponse {
  facets: AnyFacetResponse[];
  sort: Sort;
}

export type CommerceResponse =
  | CommerceSuccessResponse
  | SearchAPIErrorWithExceptionInBody
  | SearchAPIErrorWithStatusCode;
