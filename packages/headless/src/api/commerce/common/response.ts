import {AnyFacetResponse} from '../../../features/commerce/facets/facet-set/interfaces/response.js';
import {Trigger} from '../../common/trigger.js';
import {
  SearchAPIErrorWithExceptionInBody,
  SearchAPIErrorWithStatusCode,
} from '../../search/search-api-error-response.js';
import {Pagination} from './pagination.js';
import {BaseProduct} from './product.js';
import {Sort} from './sort.js';

export interface BaseCommerceSuccessResponse {
  responseId: string;
  products: BaseProduct[];
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
