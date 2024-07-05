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
 * Deprecated. The `product-recommendation` sub-package is deprecated. Use the `commerce` sub-package instead.
 * @deprecated
 */
export interface FrequentlyViewedSameCategoryListOptions {
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
 * Deprecated. The `product-recommendation` sub-package is deprecated. Use the `commerce` sub-package instead.
 * @deprecated
 */
export interface FrequentlyViewedSameCategoryListProps {
  options?: FrequentlyViewedSameCategoryListOptions;
}

/**
 * The `FrequentlyViewedSameCategoryList` controller recommends the products that have been viewed the most with the products that the user is currently viewing.
 * The recommendations are filtered to show products that have the same category as the ones the user is currently viewing.
 *
 * Deprecated. The `product-recommendation` sub-package is deprecated. Use the `commerce` sub-package instead.
 * @deprecated
 */
export interface FrequentlyViewedSameCategoryList extends Controller {
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
   * The state of the `FrequentlyViewedSameCategoryList` controller.
   */
  state: FrequentlyViewedSameCategoryListState;
}

/**
 * Deprecated. The `product-recommendation` sub-package is deprecated. Use the `commerce` sub-package instead.
 * @deprecated
 */
export interface FrequentlyViewedSameCategoryListState {
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
 * Creates a `FrequentlyViewedSameCategoryList` controller instance.
 *
 * Deprecated. The `product-recommendation` sub-package is deprecated. Use the `commerce` sub-package instead.
 * @deprecated
 *
 * @param engine - The headless engine.
 * @param props - The configurable `FrequentlyViewedSameCategoryList` properties.
 * @returns A `FrequentlyViewedSameCategoryList` controller instance.
 */
export function buildFrequentlyViewedSameCategoryList(
  engine: ProductRecommendationEngine,
  props: FrequentlyViewedSameCategoryListProps
): FrequentlyViewedSameCategoryList {
  const options = validateOptions(
    engine,
    optionsSchema,
    props.options,
    'buildFrequentlyViewedSameCategoryList'
  ) as Required<FrequentlyViewedSameCategoryListOptions>;
  return buildBaseProductRecommendationsList(engine, {
    ...props,
    options: {
      ...options,
      id: 'frequentViewedSameCategory',
    },
  });
}
