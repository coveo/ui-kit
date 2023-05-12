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

export interface FrequentlyViewedDifferentCategoryListOptions {
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

export interface FrequentlyViewedDifferentCategoryListProps {
  options?: FrequentlyViewedDifferentCategoryListOptions;
}

/**
 * The `FrequentlyViewedDifferentCategoryList` controller recommends the products that have been viewed the most with the products that the user is currently viewing.
 * The recommendations are filtered to show products that have a different category than the ones the user is currently viewing.
 */
export interface FrequentlyViewedDifferentCategoryList extends Controller {
  /**
   * Gets new recommendations based on the current SKUs.
   */
  refresh(): void;

  /**
   * Sets the SKUs of the products to fetch recommendations for.
   *
   * @param skus - The SKUs of the products to get recommendations for.
   */
  setSkus(skus: string[]): void;

  /**
   * The state of the `FrequentlyViewedDifferentCategoryList` controller.
   */
  state: FrequentlyViewedDifferentCategoryListState;
}

export interface FrequentlyViewedDifferentCategoryListState {
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
 * Creates a `FrequentlyViewedDifferentCategoryList` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `FrequentlyViewedDifferentCategoryListProps` properties.
 * @returns A `FrequentlyViewedDifferentCategoryList` controller instance.
 */
export function buildFrequentlyViewedDifferentCategoryList(
  engine: ProductRecommendationEngine,
  props: FrequentlyViewedDifferentCategoryListProps
): FrequentlyViewedDifferentCategoryList {
  const options = validateOptions(
    engine,
    optionsSchema,
    props.options,
    'buildFrequentlyViewedDifferentCategoryList'
  ) as Required<FrequentlyViewedDifferentCategoryListOptions>;
  return buildBaseProductRecommendationsList(engine, {
    ...props,
    options: {
      ...options,
      id: 'frequentViewedDifferentCategory',
    },
  });
}
