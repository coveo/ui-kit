import {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response.js';
import {Product} from '../../../api/commerce/common/product.js';
import {AnyFacetResponse} from '../facets/facet-set/interfaces/response.js';

export interface CommerceSearchState {
  error: CommerceAPIErrorStatusResponse | null;
  isLoading: boolean;
  requestId: string;
  responseId: string;
  products: Product[];
  facets: AnyFacetResponse[];
  queryExecuted: string;
}

export const getCommerceSearchInitialState = (): CommerceSearchState => ({
  error: null,
  isLoading: false,
  requestId: '',
  responseId: '',
  products: [],
  facets: [],
  queryExecuted: '',
});
