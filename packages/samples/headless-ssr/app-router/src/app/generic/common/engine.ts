import {
  defineSearchEngine,
  InferStaticState,
  InferHydratedState,
  SearchParameterManagerInitialState,
  loadPaginationActions,
} from '@coveo/headless/ssr';
import {config} from '../../../common/search-engine-config';

const engineDefinition = defineSearchEngine(config);

export type SearchStaticState = InferStaticState<typeof engineDefinition>;
export type SearchHydratedState = InferHydratedState<typeof engineDefinition>;

export const {
  fetchStaticState: {fromBuildResult: fetchStaticState},
  hydrateStaticState: {fromBuildResult: hydrateStaticState},
} = engineDefinition;

export async function fetchBuildResult(options: {
  searchParametersInitialState: SearchParameterManagerInitialState;
}) {
  const buildResult = await engineDefinition.build({
    controllers: {
      searchParameters: {initialState: options.searchParametersInitialState},
    },
  });
  const {registerNumberOfResults} = loadPaginationActions(buildResult.engine);
  buildResult.engine.dispatch(registerNumberOfResults(6));
  return buildResult;
}
