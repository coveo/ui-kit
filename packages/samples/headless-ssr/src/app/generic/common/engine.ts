import {
  defineSearchEngine,
  InferSSRState,
  InferCSRState,
} from '@coveo/headless/ssr';
import {config} from '../../common/search-engine-config';

const engineDefinition = defineSearchEngine(config);

export type SearchSSRState = InferSSRState<typeof engineDefinition>;
export type SearchCSRState = InferCSRState<typeof engineDefinition>;

export const {fetchInitialState, hydrateInitialState} = engineDefinition;
