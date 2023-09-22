import {ProductRecommendationEngine} from '../../product-recommendation.index';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  CartRecommendationsList,
  CartRecommendationsListProps,
  buildCartRecommendationsList,
} from './headless-cart-recommendations';

export * from './headless-cart-recommendations';

/**
 * @internal
 */
export const defineCartRecommendationsList = (
  props: CartRecommendationsListProps
): ControllerDefinitionWithoutProps<
  ProductRecommendationEngine,
  CartRecommendationsList
> => ({
  build: (engine) => buildCartRecommendationsList(engine, props),
});
