import {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response';
import {Product} from '../../../api/commerce/common/product';

export interface RecommendationState {
  slotId: string;
  headline: string;
  error: CommerceAPIErrorStatusResponse | null;
  isLoading: boolean;
  requestId: string;
  responseId: string;
  products: Product[];
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
