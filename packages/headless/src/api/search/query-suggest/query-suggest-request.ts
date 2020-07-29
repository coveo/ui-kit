import {SearchPageState} from '../../../state';
import {getOrganizationIdParam} from '../search-api-params';

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
  /**
   * Specifies the name of the query pipeline to use for the query. If not specified, the default query pipeline will be used.
   */
  pipeline: state.pipeline,
  /**
   * The first level of origin of the request, typically the identifier of the graphical search interface from which the request originates.
   * Coveo Machine Learning models use this information to provide contextually relevant output.
   * Notes:
   *    This parameter will be overridden if the search request is authenticated by a search token that enforces a specific searchHub.
   *    When logging a Search usage analytics event for a query, the originLevel1 field of that event should be set to the value of the searchHub search request parameter.
   */
  searchHub: state.searchHub,
});

export type QuerySuggestRequestParams = ReturnType<
  typeof querySuggestRequestParams
>;
