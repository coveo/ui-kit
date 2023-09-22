import {ProductRecommendationEngine} from '../../../product-recommendation.index';
import {ControllerDefinitionWithoutProps} from '../../../app/ssr-engine/types/common';
import {
  Context,
  buildContext,
} from './headless-product-recommendations-context';

export * from './headless-product-recommendations-context';

/**
 * @internal
 */
export const defineContext = (): ControllerDefinitionWithoutProps<
  ProductRecommendationEngine,
  Context
> => ({
  build: (engine) => buildContext(engine),
});
