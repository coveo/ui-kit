import type {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response.js';
import type {Product} from '../../../api/commerce/common/product.js';
import type {AnyFacetResponse} from '../facets/facet-set/interfaces/response.js';

export interface ProductListingState {
  error: CommerceAPIErrorStatusResponse | null;
  isLoading: boolean;
  requestId: string;
  responseId: string;
  facets: AnyFacetResponse[];
  products: Product[];
}

export const getProductListingInitialState = (): ProductListingState => ({
  error: null,
  isLoading: false,
  requestId: '',
  responseId: '',
  facets: [],
  products: [],
});
