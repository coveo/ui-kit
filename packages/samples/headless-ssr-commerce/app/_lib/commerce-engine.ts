import {
  defineCommerceEngine,
  InferStaticState,
  InferHydratedState,
} from '@coveo/headless/ssr-commerce';
import engineConfig from './commerce-engine-config';

const engineDefinition = defineCommerceEngine(engineConfig);

// TODO: only supporting Listing static state for now (KIT-3394)
export type ListingStaticState = InferStaticState<typeof engineDefinition>;
export type ListingHydratedState = InferHydratedState<typeof engineDefinition>;

export const {fetchStaticState, hydrateStaticState} = engineDefinition;
