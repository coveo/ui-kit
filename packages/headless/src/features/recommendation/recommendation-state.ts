import {SearchAPIErrorWithStatusCode} from '../../api/search/search-api-error-response';
import {Result} from '../../api/search/search/result';

export const getRecommendationInitialState = (): RecommendationState => ({
  duration: 0,
  error: null,
  isLoading: false,
  id: 'Recommendation',
  recommendations: [],
  searchUid: '',
});

export interface RecommendationState {
  /**
   * Specifies the ID of the recommendation interface.
   * @defaultValue `Recommendation`
   */
  id: string;
  /**
   * The list of recommendations.
   */
  recommendations: Result[];
  /**
   * The time it took to complete the recommendation request, in milliseconds.
   */
  duration: number;
  /**
   * The error returned by the Coveo platform while executing the recommendation request, if any. `null` otherwise.
   */
  error: SearchAPIErrorWithStatusCode | null;
  /**
   * `true` if the recommendation request is currently being executed against the Coveo platform, `false` otherwise.
   */
  isLoading: boolean;
  /**
   * A unique identifier for this recommendation request, used mainly for the Coveo Analytics service.
   */
  searchUid: string;
}
