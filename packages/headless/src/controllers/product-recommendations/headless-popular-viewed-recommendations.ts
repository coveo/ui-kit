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
 * @deprecated The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
 */
export interface PopularViewedRecommendationsListOptions {
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
 * @deprecated The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
 */
export interface PopularViewedRecommendationsListProps {
  options?: PopularViewedRecommendationsListOptions;
}

/**
 * The `PopularViewedRecommendationsList` controller recommends the most viewed products.
 * @deprecated The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
 */
export interface PopularViewedRecommendationsList extends Controller {
  /**
   * Gets new recommendations for popular viewed items.
   */
  refresh(): void;

  /**
   * The state of the `PopularViewedRecommendationsList` controller.
   */
  state: PopularViewedRecommendationsListState;
}

/**
 * @deprecated The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
 */
export interface PopularViewedRecommendationsListState {
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
 * Creates a `PopularViewedRecommendationsList` controller instance.
 * @deprecated The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `PopularViewedRecommendationsList` properties.
 * @returns A `PopularViewedRecommendationsList` controller instance.
 */
export function buildPopularViewedRecommendationsList(
  engine: ProductRecommendationEngine,
  props: PopularViewedRecommendationsListProps = {}
): PopularViewedRecommendationsList {
  const options = validateOptions(
    engine,
    optionsSchema,
    props.options,
    'buildPopularViewedRecommendationsList'
  ) as Required<PopularViewedRecommendationsListOptions>;
  const controller = buildBaseProductRecommendationsList(engine, {
    ...props,
    options: {
      ...options,
      id: 'popularViewed',
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
