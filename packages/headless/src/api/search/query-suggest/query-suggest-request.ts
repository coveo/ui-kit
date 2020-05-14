import {HeadlessState} from '../../../state';
import {getOrganizationIdParam} from '../search-request';

export const querySuggestRequestParams = (state: HeadlessState) => ({
  ...getOrganizationIdParam(state),
  /**
   * Specifies the number of suggestions that the Coveo Machine Learning service should return.
   */
  count: state.querySuggest.count,
  /**
   * The basic query expression for which to get completion.
   */
  q: state.querySuggest.q,
});

export type QuerySuggestRequestParams = ReturnType<
  typeof querySuggestRequestParams
>;
