import {Schema} from '@coveo/bueno';
import {ProductRecommendation} from '../../api/search/search/product-recommendation.js';
import {ProductRecommendationEngine} from '../../app/product-recommendation-engine/product-recommendation-engine.js';
import {validateOptions} from '../../utils/validate-payload.js';
import {ErrorPayload} from '../controller/error-payload.js';
import {Controller} from '../controller/headless-controller.js';
import {
  baseProductRecommendationsOptionsSchema,
  buildBaseProductRecommendationsList,
} from './headless-base-product-recommendations.js';

export type {ProductRecommendation};

const optionsSchema = new Schema({
  ...baseProductRecommendationsOptionsSchema,
});

export interface CartRecommendationsListOptions {
  /**
   * The SKUs of the products in the cart.
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

export interface CartRecommendationsListProps {
  options?: CartRecommendationsListOptions;
}

/**
 * The `CartRecommendationsList` controller recommends other products that were frequently purchased together in previous similar carts.
 */
export interface CartRecommendationsList extends Controller {
  /**
   * Gets new recommendations based on the current SKUs.
   */
  refresh(): void;

  /**
   * Sets the SKUs in the cart.
   *
   * @param skus - The SKUs of the products in the cart.
   */
  setSkus(skus: string[]): void;

  /**
   * The state of the `CartRecommendationsList` controller.
   */
  state: CartRecommendationsListState;
}

export interface CartRecommendationsListState {
  /**
   * The SKUs of the products in the cart.
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
   * An error returned by the Coveo platform when executing a cart recommendation request, or `null` if none is present.
   */
  error: ErrorPayload | null;

  /**
   * Whether a cart recommendation request is currently being executed against the Coveo platform.
   */
  isLoading: boolean;
}

/**
 * Creates a `CartRecommendationsList` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `CartRecommendationsList` properties.
 * @returns A `CartRecommendationsList` controller instance.
 */
export function buildCartRecommendationsList(
  engine: ProductRecommendationEngine,
  props: CartRecommendationsListProps
): CartRecommendationsList {
  const options = validateOptions(
    engine,
    optionsSchema,
    props.options,
    'buildCartRecommendationsList'
  ) as Required<CartRecommendationsListOptions>;
  return buildBaseProductRecommendationsList(engine, {
    ...props,
    options: {
      ...options,
      id: 'cart',
    },
  });
}
