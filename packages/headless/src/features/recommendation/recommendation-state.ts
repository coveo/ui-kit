import {SearchAPIErrorWithStatusCode} from '../../api/search/search-api-error-response';
import {Result} from '../../api/search/search/result';

export const getRecommendationInitialState = (): RecommendationState => ({
  duration: 0,
  error: null,
  isLoading: false,
  id: 'Recommendation',
  recommendations: [],
});

export interface RecommendationState {
  id: string;
  recommendations: Result[];
  duration: number;
  error: SearchAPIErrorWithStatusCode | null;
  isLoading: boolean;
}
