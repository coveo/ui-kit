import {HeadlessState} from '../../../state';
import {getOrganizationIdParam} from '../search-request';

export const querySuggestRequestParams = (
  id: string,
  state: HeadlessState
) => ({
  ...getOrganizationIdParam(state),
  /**
   * Specifies the number of suggestions that the Coveo Machine Learning service should return.
   */
  count: state.querySuggest[id]!.count,
  /**
   * The basic query expression for which to get completion.
   */
  q: state.querySuggest[id]!.q,
});

export type QuerySuggestRequestParams = ReturnType<
  typeof querySuggestRequestParams
>;
