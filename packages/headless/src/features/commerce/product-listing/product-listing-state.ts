import {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response';
import {ProductRecommendation} from '../../../api/search/search/product-recommendation';

export interface ProductListingV2State {
  error: CommerceAPIErrorStatusResponse | null;
  isLoading: boolean;
  responseId: string;
  products: ProductRecommendation[];
}

export const getProductListingV2InitialState = (): ProductListingV2State => ({
  error: null,
  isLoading: false,
  responseId: '',
  products: [],
});
