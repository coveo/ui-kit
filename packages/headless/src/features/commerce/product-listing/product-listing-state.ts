import type {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response.js';
import type {Result} from '../../../api/commerce/common/result.js';
import type {AnyFacetResponse} from '../facets/facet-set/interfaces/response.js';

export interface ProductListingState {
  error: CommerceAPIErrorStatusResponse | null;
  isLoading: boolean;
  requestId: string;
  responseId: string;
  facets: AnyFacetResponse[];
  results: Result[];
}

export const getProductListingInitialState = (): ProductListingState => ({
  error: null,
  isLoading: false,
  requestId: '',
  responseId: '',
  facets: [],
  results: [],
});
