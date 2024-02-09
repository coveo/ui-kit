import {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response';
import {ProductRecommendation} from '../../../api/search/search/product-recommendation';
import {AnyFacetResponse} from '../facets/facet-set/interfaces/response';

export interface ProductListingV2State {
  error: CommerceAPIErrorStatusResponse | null;
  isLoading: boolean;
  requestId: string;
  responseId: string;
  facets: AnyFacetResponse[];
  products: ProductRecommendation[];
}

export const getProductListingV2InitialState = (): ProductListingV2State => ({
  error: null,
  isLoading: false,
  requestId: '',
  responseId: '',
  facets: [],
  products: [],
});
