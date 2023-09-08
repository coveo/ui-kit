import {
  defineSearchEngine,
  InferInitialState,
  InferHydratedState,
} from '@coveo/headless/ssr';
import {config} from '../../common/search-engine-config';

const engineDefinition = defineSearchEngine(config);

export type SearchInitialState = InferInitialState<typeof engineDefinition>;
export type SearchHydratedState = InferHydratedState<typeof engineDefinition>;

export const {fetchInitialState, hydrateInitialState} = engineDefinition;
