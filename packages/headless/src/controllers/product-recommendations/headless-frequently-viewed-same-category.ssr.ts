import {ProductRecommendationEngine} from '../../product-recommendation.index';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  FrequentlyViewedSameCategoryList,
  FrequentlyViewedSameCategoryListProps,
  buildFrequentlyViewedSameCategoryList,
} from './headless-frequently-viewed-same-category';

export * from './headless-frequently-viewed-same-category';

/**
 * @internal
 */
export const defineFrequentlyViewedSameCategoryList = (
  props: FrequentlyViewedSameCategoryListProps
): ControllerDefinitionWithoutProps<
  ProductRecommendationEngine,
  FrequentlyViewedSameCategoryList
> => ({
  build: (engine) => buildFrequentlyViewedSameCategoryList(engine, props),
});
