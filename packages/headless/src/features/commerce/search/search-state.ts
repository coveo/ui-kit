import type {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response.js';
import type {Product} from '../../../api/commerce/common/product.js';
import type {Result} from '../../../api/commerce/common/result.js';
import type {AnyFacetResponse} from '../facets/facet-set/interfaces/response.js';

export interface CommerceSearchState {
  error: CommerceAPIErrorStatusResponse | null;
  isLoading: boolean;
  requestId: string;
  responseId: string;
  products: Product[];
  results: Result[];
  facets: AnyFacetResponse[];
  queryExecuted: string;
}

export const getCommerceSearchInitialState = (): CommerceSearchState => ({
  error: null,
  isLoading: false,
  requestId: '',
  responseId: '',
  products: [],
  results: [],
  facets: [],
  queryExecuted: '',
});
