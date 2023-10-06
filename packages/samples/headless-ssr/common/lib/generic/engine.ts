import {
  defineSearchEngine,
  InferStaticState,
  InferHydratedState,
} from '@coveo/headless/ssr';
import {config} from '../../components/common/search-engine-config';

const engineDefinition = defineSearchEngine(config);

export type SearchStaticState = InferStaticState<typeof engineDefinition>;
export type SearchHydratedState = InferHydratedState<typeof engineDefinition>;

export const {fetchStaticState, hydrateStaticState} = engineDefinition;
