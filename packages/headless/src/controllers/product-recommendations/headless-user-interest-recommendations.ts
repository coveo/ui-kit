import {Schema} from '@coveo/bueno';
import {SearchAPIErrorWithStatusCode} from '../../api/search/search-api-error-response';
import {ProductRecommendation} from '../../api/search/search/product-recommendation';
import {ProductRecommendationEngine} from '../../app/product-recommendation-engine/product-recommendation-engine';
import {validateOptions} from '../../utils/validate-payload';
import {Controller} from '../controller/headless-controller';
import {
  baseProductRecommendationsOptionsSchema,
  buildBaseProductRecommendationsList,
} from './headless-base-product-recommendations';

const optionsSchema = new Schema({
  maxNumberOfRecommendations:
    baseProductRecommendationsOptionsSchema.maxNumberOfRecommendations,
  additionalFields: baseProductRecommendationsOptionsSchema.additionalFields,
});

/**
 * Deprecated. The `product-recommendation` sub-package is deprecated. Use the `commerce` sub-package instead.
 * @internal
 */
export interface UserInterestRecommendationsListOptions {
  /**
   * The maximum number of recommendations, from 1 to 50.
   *
   * @defaultValue `5`
   */
  maxNumberOfRecommendations?: number;

  /**
   * Additional fields to fetch in the results.
   */
  additionalFields?: string[];
}

/**
 * Deprecated. The `product-recommendation` sub-package is deprecated. Use the `commerce` sub-package instead.
 * @internal
 */
export interface UserInterestRecommendationsListProps {
  options?: UserInterestRecommendationsListOptions;
}

/**
 * The `UserInterestRecommendationsList` controller recommends products to the current user based on their general interests.
 * To achieve this, ML models learn from users' previous actions, and use this information to find other customers that share similar browsing patterns.
 * The model then suggests products that have been previously browsed by customers who share similar interests with the current user.
 *
 * Deprecated. The `product-recommendation` sub-package is deprecated. Use the `commerce` sub-package instead.
 * @internal
 */
export interface UserInterestRecommendationsList extends Controller {
  /**
   * Gets new recommendations for items that may be of interest to the user.
   */
  refresh(): void;

  /**
   * The state of the `UserInterestRecommendationsList` controller.
   */
  state: UserInterestRecommendationsListState;
}

/**
 * Deprecated. The `product-recommendation` sub-package is deprecated. Use the `commerce` sub-package instead.
 * @internal
 */
export interface UserInterestRecommendationsListState {
  /**
   * The maximum number of recommendations.
   */
  maxNumberOfRecommendations: number;

  /**
   * The products recommended by the Coveo platform.
   */
  recommendations: ProductRecommendation[];

  /**
   * An error returned by the Coveo platform when executing a recommendation request, or `null` if none is present.
   */
  error: SearchAPIErrorWithStatusCode | null;

  /**
   * Whether a recommendation request is currently being executed against the Coveo platform.
   */
  isLoading: boolean;
}

/**
 * Creates a `UserInterestRecommendationsList` controller instance.
 *
 * Deprecated. The `product-recommendation` sub-package is deprecated. Use the `commerce` sub-package instead.
 * @internal
 *
 * @param engine - The headless engine.
 * @param props - The configurable `UserInterestRecommendationsList` properties.
 * @returns A `UserInterestRecommendationsList` controller instance.
 */
export function buildUserInterestRecommendationsList(
  engine: ProductRecommendationEngine,
  props: UserInterestRecommendationsListProps
): UserInterestRecommendationsList {
  const options = validateOptions(
    engine,
    optionsSchema,
    props.options,
    'buildUserInterestRecommendationsList'
  ) as Required<UserInterestRecommendationsListOptions>;
  const controller = buildBaseProductRecommendationsList(engine, {
    ...props,
    options: {
      ...options,
      id: 'user',
    },
  });

  const {setSkus, ...rest} = controller;

  return {
    ...rest,

    get state() {
      const {skus, ...rest} = controller.state;

      return {
        ...rest,
      };
    },
  };
}
