import {Schema} from '@coveo/bueno';
import {
  baseProductRecommendationsOptionsSchema,
  buildBaseProductRecommendationsList,
} from './headless-base-product-recommendations';
import {validateOptions} from '../../utils/validate-payload';
import {Controller} from '../controller/headless-controller';
import {ProductRecommendation} from '../../api/search/search/product-recommendation';
import {CartRecommendationsListOptions} from './headless-cart-recommendations-options';
import {ErrorPayload} from '../controller/error-payload';
import {ProductRecommendationEngine} from '../../app/product-recommendation-engine/product-recommendation-engine';

export {CartRecommendationsListOptions, ProductRecommendation};

const optionsSchema = new Schema({
  ...baseProductRecommendationsOptionsSchema,
});

export interface CartRecommendationsListProps {
  options?: CartRecommendationsListOptions;
}

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
   * An error returned by the Coveo platform when executing a cart recommendation request, if any. This is `null` otherwise.
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
