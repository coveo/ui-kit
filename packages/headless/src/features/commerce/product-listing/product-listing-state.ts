import {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response';
import {Product} from '../../../api/commerce/common/product';
import {AnyFacetResponse} from '../facets/facet-set/interfaces/response';

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
