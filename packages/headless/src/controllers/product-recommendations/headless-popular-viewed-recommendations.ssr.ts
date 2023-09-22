import {ProductRecommendationEngine} from '../../product-recommendation.index';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  PopularViewedRecommendationsList,
  PopularViewedRecommendationsListProps,
  buildPopularViewedRecommendationsList,
} from './headless-popular-viewed-recommendations';

export * from './headless-popular-viewed-recommendations';

/**
 * @internal
 */
export const definePopularViewedRecommendationsList = (
  props?: PopularViewedRecommendationsListProps
): ControllerDefinitionWithoutProps<
  ProductRecommendationEngine,
  PopularViewedRecommendationsList
> => ({
  build: (engine) => buildPopularViewedRecommendationsList(engine, props),
});
