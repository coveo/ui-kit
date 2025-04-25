import {QuerySuggestRequest} from '../../../api/commerce/search/query-suggest/query-suggest-request.js';
import {NavigatorContext} from '../../../app/navigator-context-provider.js';
import {buildBaseCommerceAPIRequest} from '../common/base-commerce-api-request-builder.js';
import {StateNeededByQuerySuggest} from './query-suggest-actions.js';

export const buildQuerySuggestRequest = (
  id: string,
  state: StateNeededByQuerySuggest,
  navigatorContext: NavigatorContext
): QuerySuggestRequest => {
  return {
    ...buildBaseCommerceAPIRequest(state, navigatorContext),
    query: state.querySet[id],
  };
};
