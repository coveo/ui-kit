import {
  defineCommerceEngine,
  InferStaticState,
  InferHydratedState,
} from '@coveo/headless/ssr-commerce';
import engineConfig from './commerce-engine-config';

const engineDefinition = defineCommerceEngine(engineConfig);

export const {ProductListingEngine, SearchEngine} = engineDefinition;

export type ListingStaticState = InferStaticState<typeof SearchEngine>;
export type ListingHydratedState = InferHydratedState<typeof SearchEngine>;

export type SearchStaticState = InferStaticState<typeof ProductListingEngine>;
export type SearchHydratedState = InferHydratedState<
  typeof ProductListingEngine
>;
