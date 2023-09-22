import {ProductRecommendationEngine} from '../../product-recommendation.index';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  PopularBoughtRecommendationsList,
  PopularBoughtRecommendationsListProps,
  buildPopularBoughtRecommendationsList,
} from './headless-popular-bought-recommendations';

export * from './headless-popular-bought-recommendations';

/**
 * @internal
 */
export const definePopularBoughtRecommendationsList = (
  props?: PopularBoughtRecommendationsListProps
): ControllerDefinitionWithoutProps<
  ProductRecommendationEngine,
  PopularBoughtRecommendationsList
> => ({
  build: (engine) => buildPopularBoughtRecommendationsList(engine, props),
});
