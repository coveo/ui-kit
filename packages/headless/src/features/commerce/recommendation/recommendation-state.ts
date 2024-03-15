import {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response';
import {ProductRecommendation} from '../../../api/search/search/product-recommendation';

export interface RecommendationV2State {
  slotId: string;
  error: CommerceAPIErrorStatusResponse | null;
  isLoading: boolean;
  requestId: string;
  responseId: string;
  products: ProductRecommendation[];
}

export const getRecommendationV2InitialState = (): RecommendationV2State => ({
  slotId: '',
  error: null,
  isLoading: false,
  requestId: '',
  responseId: '',
  products: [],
});
