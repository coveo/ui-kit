import {Schema, StringValue} from '@coveo/bueno';
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
  sku: new StringValue({required: true, emptyAllowed: false}),
  maxNumberOfRecommendations:
    baseProductRecommendationsOptionsSchema.maxNumberOfRecommendations,
  additionalFields: baseProductRecommendationsOptionsSchema.additionalFields,
});

/**
 * @deprecated The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
 */
export interface FrequentlyBoughtTogetherListOptions {
  /**
   * The SKU of the product to fetch recommendations for.
   */
  sku: string;

  /**
   * The maximum number of recommendations, from 1 to 50.
   *
   * @defaultValue `5`
   */
  maxNumberOfRecommendations?: number;

  /**
   * Additional fields to fetch in the results.
   */
  additionalFields?: string[] | null | undefined;
}

/**
 * @deprecated The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
 */
export interface FrequentlyBoughtTogetherListProps {
  options: FrequentlyBoughtTogetherListOptions;
}

/**
 * The `FrequentlyBoughtTogetherList` controller recommends items frequently bought with the current product, based on purchases made by other users.
 * @deprecated The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
 */
export interface FrequentlyBoughtTogetherList extends Controller {
  /**
   * Sets the SKU of the product you wish to get frequently bought together suggestions for.
   *
   * @param sku - The product to get recommendations for.
   */
  setSku(sku: string): void;

  /**
   * The state of the `FrequentlyBoughtTogetherList` controller.
   */
  state: FrequentlyBoughtTogetherListState;

  /**
   * Gets new recommendations based on the current SKUs.
   */
  refresh(): void;
}

/**
 * @deprecated The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
 */
export interface FrequentlyBoughtTogetherListState {
  /**
   * The SKU of the product to get recommendations for.
   */
  sku: string;

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
 * Creates a `FrequentlyBoughtTogetherList` controller instance.
 * @deprecated The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `FrequentlyBoughtTogetherList` properties.
 * @returns A `FrequentlyBoughtTogetherList` controller instance.
 */
export function buildFrequentlyBoughtTogetherList(
  engine: ProductRecommendationEngine,
  props: FrequentlyBoughtTogetherListProps
): FrequentlyBoughtTogetherList {
  const options = validateOptions(
    engine,
    optionsSchema,
    props.options,
    'buildFrequentlyBoughtTogetherList'
  ) as Required<FrequentlyBoughtTogetherListOptions>;
  const controller = buildBaseProductRecommendationsList(engine, {
    ...props,
    options: {
      maxNumberOfRecommendations: options.maxNumberOfRecommendations,
      additionalFields: options.additionalFields,
      skus: [options.sku],
      id: 'frequentBought',
    },
  });

  const {setSkus, ...rest} = controller;

  return {
    ...rest,

    setSku(sku: string) {
      setSkus([sku]);
    },

    get state() {
      const {skus, ...rest} = controller.state;

      return {
        ...rest,
        sku: skus[0],
      };
    },
  };
}
