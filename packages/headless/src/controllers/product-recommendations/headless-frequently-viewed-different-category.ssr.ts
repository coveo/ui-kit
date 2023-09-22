import {ProductRecommendationEngine} from '../../product-recommendation.index';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  FrequentlyViewedDifferentCategoryList,
  FrequentlyViewedDifferentCategoryListProps,
  buildFrequentlyViewedDifferentCategoryList,
} from './headless-frequently-viewed-different-category';

export * from './headless-frequently-viewed-different-category';

/**
 * @internal
 */
export const defineFrequentlyViewedDifferentCategoryList = (
  props: FrequentlyViewedDifferentCategoryListProps
): ControllerDefinitionWithoutProps<
  ProductRecommendationEngine,
  FrequentlyViewedDifferentCategoryList
> => ({
  build: (engine) => buildFrequentlyViewedDifferentCategoryList(engine, props),
});
