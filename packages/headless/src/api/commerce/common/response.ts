import type {AnyFacetResponse} from '../../../features/commerce/facets/facet-set/interfaces/response.js';
import type {Trigger} from '../../common/trigger.js';
import type {
  SearchAPIErrorWithExceptionInBody,
  SearchAPIErrorWithStatusCode,
} from '../../search/search-api-error-response.js';
import type {Pagination} from './pagination.js';
import type {BaseProduct} from './product.js';
import type {Sort} from './sort.js';

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
