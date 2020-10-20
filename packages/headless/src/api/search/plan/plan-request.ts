import {SearchAppState} from '../../../state/search-app-state';
import {getQParam} from '../search-api-params';

export const planRequest = (state: SearchAppState) => ({
  ...getQParam(state),
  context: state.context.contextValues,
  pipeline: state.pipeline,
  searchHub: state.searchHub,
});

export type PlanRequest = ReturnType<typeof planRequest>;
