import {createAsyncThunk} from '@reduxjs/toolkit';
import {getVisitorID} from '../../../api/analytics/coveo-analytics-utils';
import {
  AsyncThunkCommerceOptions,
  isErrorResponse,
} from '../../../api/commerce/commerce-api-client';
import {QuerySuggestRequest} from '../../../api/commerce/search/query-suggest/query-suggest-request';
import {QuerySuggestSuccessResponse} from '../../../api/commerce/search/query-suggest/query-suggest-response';
import {
  CartSection,
  CommerceContextSection,
  CommerceQuerySection,
  ConfigurationSection,
  QuerySetSection,
  VersionSection,
} from '../../../state/state-sections';
import {
  FetchQuerySuggestionsActionCreatorPayload,
  idDefinition,
} from '../../query-suggest/query-suggest-actions';
import {getProductsFromCartState} from '../context/cart/cart-state';

export type StateNeededByQuerySuggest = ConfigurationSection &
  CommerceContextSection &
  CartSection &
  QuerySetSection &
  CommerceQuerySection &
  Partial<VersionSection>;

export interface FetchQuerySuggestionsThunkReturn
  extends FetchQuerySuggestionsActionCreatorPayload,
    QuerySuggestSuccessResponse {
  /**
   * The query for which query suggestions were retrieved.
   */
  query: string | undefined;
}

export const fetchQuerySuggestions = createAsyncThunk<
  FetchQuerySuggestionsThunkReturn,
  FetchQuerySuggestionsActionCreatorPayload,
  AsyncThunkCommerceOptions<StateNeededByQuerySuggest>
>(
  'commerce/querySuggest/fetch',
  async (
    payload: {id: string},
    {getState, rejectWithValue, extra: {apiClient, validatePayload}}
  ) => {
    validatePayload(payload, idDefinition);
    const state = getState();
    const request = await buildQuerySuggestRequest(payload.id, state);
    const response = await apiClient.querySuggest(request);

    if (isErrorResponse(response)) {
      return rejectWithValue(response.error);
    }

    return {
      id: payload.id,
      query: request.query,
      ...response.success,
    };
  }
);

export const buildQuerySuggestRequest = async (
  id: string,
  state: StateNeededByQuerySuggest
): Promise<QuerySuggestRequest> => {
  const {view, user, ...restOfContext} = state.commerceContext;
  return {
    accessToken: state.configuration.accessToken,
    url: state.configuration.platformUrl,
    organizationId: state.configuration.organizationId,
    trackingId: state.configuration.analytics.trackingId,
    query: state.querySet[id],
    ...restOfContext,
    clientId: await getVisitorID(state.configuration.analytics),
    context: {
      user,
      view,
      capture: state.configuration.analytics.enabled,
      cart: getProductsFromCartState(state.cart),
    },
  };
};
