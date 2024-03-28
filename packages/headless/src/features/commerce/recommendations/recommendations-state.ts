import {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response';
import {Product} from '../../../api/commerce/common/product';

export interface RecommendationsState {
  slotId: string;
  headline: string;
  error: CommerceAPIErrorStatusResponse | null;
  isLoading: boolean;
  responseId: string;
  products: Product[];
}

export const getRecommendationsInitialState = (): RecommendationsState => ({
  slotId: '',
  headline: '',
  error: null,
  isLoading: false,
  responseId: '',
  products: [],
});
