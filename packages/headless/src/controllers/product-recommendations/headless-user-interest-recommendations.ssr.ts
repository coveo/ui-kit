import {ProductRecommendationEngine} from '../../product-recommendation.index';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  UserInterestRecommendationsList,
  UserInterestRecommendationsListProps,
  buildUserInterestRecommendationsList,
} from './headless-user-interest-recommendations';

export * from './headless-user-interest-recommendations';

/**
 * @internal
 */
export const defineUserInterestRecommendationsList = (
  props: UserInterestRecommendationsListProps
): ControllerDefinitionWithoutProps<
  ProductRecommendationEngine,
  UserInterestRecommendationsList
> => ({
  build: (engine) => buildUserInterestRecommendationsList(engine, props),
});
