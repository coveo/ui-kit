import {
  defineCommerceEngine,
  InferStaticState,
  InferHydratedState,
} from '@coveo/headless/ssr-commerce';
import engineConfig from './commerce-engine-config';

const engineDefinition = defineCommerceEngine(engineConfig);

export const {listingEngineDefinition, searchEngineDefinition} =
  engineDefinition;

export type ListingStaticState = InferStaticState<
  typeof searchEngineDefinition
>;
export type ListingHydratedState = InferHydratedState<
  typeof searchEngineDefinition
>;

export type SearchStaticState = InferStaticState<
  typeof listingEngineDefinition
>;
export type SearchHydratedState = InferHydratedState<
  typeof listingEngineDefinition
>;
