import {ProductRecommendationEngine} from '../../product-recommendation.index';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  FrequentlyBoughtTogetherList,
  FrequentlyBoughtTogetherListProps,
  buildFrequentlyBoughtTogetherList,
} from './headless-frequently-bought-together';

export * from './headless-frequently-bought-together';

/**
 * @internal
 */
export const defineFrequentlyBoughtTogetherList = (
  props: FrequentlyBoughtTogetherListProps
): ControllerDefinitionWithoutProps<
  ProductRecommendationEngine,
  FrequentlyBoughtTogetherList
> => ({
  build: (engine) => buildFrequentlyBoughtTogetherList(engine, props),
});
