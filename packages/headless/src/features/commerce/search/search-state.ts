import {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response';
import {ProductRecommendation} from '../../../api/search/search/product-recommendation';
import {AnyFacetResponse} from '../facets/facet-set/interfaces/response';

export interface CommerceSearchState {
  error: CommerceAPIErrorStatusResponse | null;
  isLoading: boolean;
  requestId: string;
  responseId: string;
  products: ProductRecommendation[];
  facets: AnyFacetResponse[];
}

export const getCommerceSearchInitialState = (): CommerceSearchState => ({
  error: null,
  isLoading: false,
  requestId: '',
  responseId: '',
  products: [],
  facets: [],
});
