import {NumberValue} from '@coveo/bueno';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {getAnalyticsSource} from '../../../api/analytics/analytics-selectors.js';
import {
  AsyncThunkCommerceOptions,
  getCommerceApiBaseUrl,
  isErrorResponse,
} from '../../../api/commerce/commerce-api-client.js';
import {QuerySuggestRequest} from '../../../api/commerce/search/query-suggest/query-suggest-request.js';
import {QuerySuggestSuccessResponse} from '../../../api/commerce/search/query-suggest/query-suggest-response.js';
import {NavigatorContext} from '../../../app/navigatorContextProvider.js';
import {
  CartSection,
  CommerceContextSection,
  CommerceQuerySection,
  CommerceConfigurationSection,
  QuerySetSection,
  VersionSection,
} from '../../../state/state-sections.js';
import {
  requiredEmptyAllowedString,
  requiredNonEmptyString,
  validatePayload,
} from '../../../utils/validate-payload.js';
import {
  ClearQuerySuggestActionCreatorPayload,
  FetchQuerySuggestionsActionCreatorPayload,
  RegisterQuerySuggestActionCreatorPayload,
  SelectQuerySuggestionActionCreatorPayload,
} from '../../query-suggest/query-suggest-actions.js';
import {getProductsFromCartState} from '../context/cart/cart-state.js';

export type ClearQuerySuggestPayload = ClearQuerySuggestActionCreatorPayload;

export const clearQuerySuggest = createAction(
  'commerce/querySuggest/clear',
  (payload: ClearQuerySuggestPayload) =>
    validatePayload(payload, {id: requiredNonEmptyString})
);

export type FetchQuerySuggestionsPayload =
  FetchQuerySuggestionsActionCreatorPayload;

export type StateNeededByQuerySuggest = CommerceConfigurationSection &
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
  FetchQuerySuggestionsPayload,
  AsyncThunkCommerceOptions<StateNeededByQuerySuggest>
>(
  'commerce/querySuggest/fetch',
  async (
    payload: {id: string},
    {
      getState,
      rejectWithValue,
      extra: {apiClient, validatePayload, navigatorContext},
    }
  ) => {
    validatePayload(payload, {
      id: requiredNonEmptyString,
    });
    const state = getState();
    const request = buildQuerySuggestRequest(
      payload.id,
      state,
      navigatorContext
    );
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

export type RegisterQuerySuggestPayload =
  RegisterQuerySuggestActionCreatorPayload;

export const registerQuerySuggest = createAction(
  'commerce/querySuggest/register',
  (payload: RegisterQuerySuggestPayload) =>
    validatePayload(payload, {
      id: requiredNonEmptyString,
      count: new NumberValue({min: 0}),
    })
);

export type SelectQuerySuggestionPayload =
  SelectQuerySuggestionActionCreatorPayload;

export const selectQuerySuggestion = createAction(
  'commerce/querySuggest/selectSuggestion',
  (payload: SelectQuerySuggestionPayload) =>
    validatePayload(payload, {
      id: requiredNonEmptyString,
      expression: requiredEmptyAllowedString,
    })
);

export const buildQuerySuggestRequest = (
  id: string,
  state: StateNeededByQuerySuggest,
  navigatorContext: NavigatorContext
): QuerySuggestRequest => {
  const {view, ...restOfContext} = state.commerceContext;
  return {
    accessToken: state.configuration.accessToken,
    url:
      state.configuration.commerce.apiBaseUrl ??
      getCommerceApiBaseUrl(
        state.configuration.organizationId,
        state.configuration.environment
      ),
    organizationId: state.configuration.organizationId,
    trackingId: state.configuration.analytics.trackingId,
    query: state.querySet[id],
    ...restOfContext,
    ...(state.configuration.analytics.enabled
      ? {clientId: navigatorContext.clientId}
      : {}),
    context: {
      ...(navigatorContext.userAgent
        ? {
            user: {
              userAgent: navigatorContext.userAgent,
            },
          }
        : {}),
      view: {
        ...view,
        ...(navigatorContext.referrer
          ? {referrer: navigatorContext.referrer}
          : {}),
      },
      capture: state.configuration.analytics.enabled,
      cart: getProductsFromCartState(state.cart),
      source: getAnalyticsSource(state.configuration.analytics),
    },
  };
};
