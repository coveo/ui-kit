import {SearchPageState} from '../../../state';
import {getQParam} from '../search-api-params';

export const planRequest = (state: SearchPageState) => ({
  ...getQParam(state),
  context: state.context.contextValues,
  pipeline: state.pipeline,
  searchHub: state.searchHub,
});

export type PlanRequest = ReturnType<typeof planRequest>;
