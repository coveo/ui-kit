import {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response';
import {ProductRecommendation} from '../../../api/search/search/product-recommendation';

export interface RecommendationState {
  slotId: string;
  headline: string;
  error: CommerceAPIErrorStatusResponse | null;
  isLoading: boolean;
  requestId: string;
  responseId: string;
  products: ProductRecommendation[];
}

export const getRecommendationV2InitialState = (): RecommendationState => ({
  slotId: '',
  headline: '',
  error: null,
  isLoading: false,
  requestId: '',
  responseId: '',
  products: [],
});
