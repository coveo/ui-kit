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
  typeof listingEngineDefinition
>;
export type ListingHydratedState = InferHydratedState<
  typeof listingEngineDefinition
>;

export type SearchStaticState = InferStaticState<typeof searchEngineDefinition>;
export type SearchHydratedState = InferHydratedState<
  typeof searchEngineDefinition
>;
