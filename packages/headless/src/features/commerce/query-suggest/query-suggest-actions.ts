import {createRelay} from '@coveo/relay';
import {createAsyncThunk} from '@reduxjs/toolkit';
import {getAnalyticsSource} from '../../../api/analytics/search-analytics';
import {AsyncThunkCommerceOptions} from '../../../api/commerce/commerce-api-client';
import {QuerySuggestRequest} from '../../../api/commerce/search/query-suggest/query-suggest-request';
import {QuerySuggestSuccessResponse} from '../../../api/commerce/search/query-suggest/query-suggest-response';
import {isErrorResponse} from '../../../api/search/search-api-client';
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
    const request = buildQuerySuggestRequest(payload.id, state);
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

export const buildQuerySuggestRequest = (
  id: string,
  state: StateNeededByQuerySuggest
): QuerySuggestRequest => {
  const {view, user, trackingId, ...restOfContext} = state.commerceContext;
  const relayOptions = {
    url: state.configuration.analytics.nextApiBaseUrl,
    token: state.configuration.accessToken,
    trackingId,
    source: getAnalyticsSource(state.configuration.analytics),
  };
  const relay = createRelay(relayOptions);
  const {getMeta} = relay;
  return {
    accessToken: state.configuration.accessToken,
    url: state.configuration.platformUrl,
    organizationId: state.configuration.organizationId,
    query: state.querySet[id],
    trackingId,
    ...restOfContext,
    clientId: getMeta('ec.productView').clientId,
    context: {
      user,
      view,
      cart: state.cart.cartItems.map((id) => state.cart.cart[id]),
    },
  };
};
