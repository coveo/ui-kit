import {HeadlessState} from '../../../state';
import {getQParam, getOrganizationIdParam} from '../search-request';

export const planRequestParams = (state: HeadlessState) => ({
  ...getQParam(state),
  ...getOrganizationIdParam(state),
});

export type PlanRequestParams = ReturnType<typeof planRequestParams>;
