import {ProductRecommendationEngine} from '../../product-recommendation.index';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  FrequentlyViewedTogetherList,
  FrequentlyViewedTogetherListProps,
  buildFrequentlyViewedTogetherList,
} from './headless-frequently-viewed-together';

export * from './headless-frequently-viewed-together';

/**
 * @internal
 */
export const defineFrequentlyViewedTogetherList = (
  props: FrequentlyViewedTogetherListProps
): ControllerDefinitionWithoutProps<
  ProductRecommendationEngine,
  FrequentlyViewedTogetherList
> => ({
  build: (engine) => buildFrequentlyViewedTogetherList(engine, props),
});
