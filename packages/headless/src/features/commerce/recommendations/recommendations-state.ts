import {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response';
import {Product} from '../../../api/commerce/common/product';

export interface RecommendationsSlice {
  headline: string;
  error: CommerceAPIErrorStatusResponse | null;
  isLoading: boolean;
  responseId: string;
  products: Product[];
}

/**
 * An object in which each key is a slot identifier, and each value is the corresponding recommendations slice.
 */
export type RecommendationsState = Record<
  string,
  RecommendationsSlice | undefined
>;

export const getRecommendationsInitialState = (): RecommendationsState => ({});
export const getRecommendationsSliceInitialState =
  (): RecommendationsSlice => ({
    headline: '',
    error: null,
    isLoading: false,
    responseId: '',
    products: [],
  });
