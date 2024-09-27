import {SearchAPIErrorWithStatusCode} from '../../api/search/search-api-error-response.js';
import {Result} from '../../api/search/search/result.js';

export const getRecommendationInitialState = (): RecommendationState => ({
  duration: 0,
  error: null,
  isLoading: false,
  id: 'Recommendation',
  recommendations: [],
  searchUid: '',
  splitTestRun: '',
  pipeline: '',
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
  /**
   * The version of the A/B test that applied to the related recommendation (i.e., version A or version B).
   */
  splitTestRun: string;
  /**
   * Specifies the name of the query pipeline used for recommendation.
   */
  pipeline: string;
}
