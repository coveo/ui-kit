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
  ...baseProductRecommendationsOptionsSchema,
});

/**
 * @deprecated The `product-recommendation` sub-package is deprecated. Use the `commerce` sub-package instead.
 */
export interface FrequentlyViewedTogetherListOptions {
  /**
   * The SKUs of the products to fetch recommendations for.
   */
  skus?: string[];

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
 * @deprecated The `product-recommendation` sub-package is deprecated. Use the `commerce` sub-package instead.
 */
export interface FrequentlyViewedTogetherListProps {
  options?: FrequentlyViewedTogetherListOptions;
}

/**
 * The `FrequentlyViewedTogetherList` controller recommends products that are often viewed in the same shopping session.
 * @deprecated The `product-recommendation` sub-package is deprecated. Use the `commerce` sub-package instead.
 */
export interface FrequentlyViewedTogetherList extends Controller {
  /**
   * Gets new recommendations based on the current SKUs.
   */
  refresh(): void;

  /**
   * Sets the SKUs of the products to fetch recommendations for.
   *
   * @param skus - The SKUs of the products to fetch recommendations for.
   */
  setSkus(skus: string[]): void;

  /**
   * The state of the `FrequentlyViewedTogetherList` controller.
   */
  state: FrequentlyViewedTogetherListState;
}

/**
 * @deprecated The `product-recommendation` sub-package is deprecated. Use the `commerce` sub-package instead.
 */
export interface FrequentlyViewedTogetherListState {
  /**
   * The SKUs of the products to fetch recommendations for.
   */
  skus: string[];

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
 * Creates a `FrequentlyViewedTogetherList` controller instance.
 * @deprecated The `product-recommendation` sub-package is deprecated. Use the `commerce` sub-package instead.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `FrequentlyViewedTogetherList` properties.
 * @returns A `FrequentlyViewedTogetherList` controller instance.
 */
export function buildFrequentlyViewedTogetherList(
  engine: ProductRecommendationEngine,
  props: FrequentlyViewedTogetherListProps
): FrequentlyViewedTogetherList {
  const options = validateOptions(
    engine,
    optionsSchema,
    props.options,
    'buildFrequentlyViewedTogetherList'
  ) as Required<FrequentlyViewedTogetherListOptions>;
  return buildBaseProductRecommendationsList(engine, {
    ...props,
    options: {
      ...options,
      id: 'frequentViewed',
    },
  });
}
