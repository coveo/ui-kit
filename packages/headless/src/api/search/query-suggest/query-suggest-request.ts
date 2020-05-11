import {HeadlessState} from '../../../state';
import {getQParam, getOrganizationIdParam} from '../search-request';

export const querySuggestRequestParams = (state: HeadlessState) => ({
  ...getQParam(state),
  ...getOrganizationIdParam(state),
  /**
   * Specifies the number of suggestions that the Coveo Machine Learning service should return.
   */
  count: state.querySuggest.count,
});

export type QuerySuggestRequestParams = ReturnType<
  typeof querySuggestRequestParams
>;
