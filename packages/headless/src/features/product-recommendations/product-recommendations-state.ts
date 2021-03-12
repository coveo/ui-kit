import {SearchAPIErrorWithStatusCode} from '../../api/search/search-api-error-response';

import {ProductRecommendation} from '../../api/search/search/product-recommendation';

export type ProductRecommendationsState = {
  id: string;
  skus: string[];
  maxNumberOfRecommendations: number;
  filter: {
    brand: string;
    category: string;
  };
  recommendations: ProductRecommendation[];
  error: SearchAPIErrorWithStatusCode | null;
  isLoading: boolean;
  searchUid: string;
  duration: number;
};

export const getProductRecommendationsInitialState = (): ProductRecommendationsState => ({
  id: '',
  skus: [],
  maxNumberOfRecommendations: 5,
  filter: {
    brand: '',
    category: '',
  },
  recommendations: [],
  error: null,
  isLoading: false,
  searchUid: '',
  duration: 0,
});
