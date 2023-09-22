import {
  defineProductRecommendationEngine,
  InferStaticState,
  InferHydratedState,
} from '@coveo/headless-react/ssr/product-recommendation';
import {config} from '../../common/product-recommendation-engine-config';

const engineDefinition = defineProductRecommendationEngine(config);

export type SearchStaticState = InferStaticState<typeof engineDefinition>;
export type SearchHydratedState = InferHydratedState<typeof engineDefinition>;

export const {
  fetchStaticState,
  hydrateStaticState,
  StaticStateProvider,
  HydratedStateProvider,
} = engineDefinition;

export const {usePopularBought} = engineDefinition.controllers;
