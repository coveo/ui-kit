import type {QuerySuggestRequest} from '../../../api/commerce/search/query-suggest/query-suggest-request.js';
import type {NavigatorContext} from '../../../app/navigator-context-provider.js';
import {buildBaseCommerceAPIRequest} from '../common/base-commerce-api-request-builder.js';
import type {StateNeededByQuerySuggest} from './query-suggest-actions.js';

export interface QuerySuggestRequestOptions {
  count?: number;
}

export const buildQuerySuggestRequest = (
  id: string,
  state: StateNeededByQuerySuggest,
  navigatorContext: NavigatorContext,
  options: QuerySuggestRequestOptions = {}
): QuerySuggestRequest => {
  return {
    ...buildBaseCommerceAPIRequest(state, navigatorContext),
    query: state.querySet[id],
    count: options.count,
  };
};
