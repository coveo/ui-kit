import {
  defineSearchEngine,
  type InferHydratedState,
  type InferStaticState,
} from '@coveo/headless/ssr-next';
import {config} from '../search-engine-config';

export const {searchEngineDefinition} = defineSearchEngine(config);

export type SearchStaticState = InferStaticState<typeof searchEngineDefinition>;
export type SearchHydratedState = InferHydratedState<typeof searchEngineDefinition>;
