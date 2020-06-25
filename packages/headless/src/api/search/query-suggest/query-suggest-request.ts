import {SearchPageState} from '../../../state';
import {getOrganizationIdParam} from '../search-request';

export const querySuggestRequestParams = (
  id: string,
  state: SearchPageState
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
  /**
   * Specifies the context that Coveo Machine Learning should leverage to return suggestions.
   */
  context: state.context.contextValues,
});

export type QuerySuggestRequestParams = ReturnType<
  typeof querySuggestRequestParams
>;
