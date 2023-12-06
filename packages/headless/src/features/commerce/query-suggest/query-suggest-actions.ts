import {isErrorResponse} from '../../../api/search/search-api-client';

import {createAsyncThunk, FetchQuerySuggestionsActionCreatorPayload} from '../../../ssr.index';
import {
  CartSection,
  CommerceContextSection, CommerceQuerySection,
  ConfigurationSection, QuerySetSection,
  VersionSection
} from '../../../state/state-sections';
import {AsyncThunkCommerceOptions} from '../../../api/commerce/commerce-api-client';
import {QuerySuggestSuccessResponse} from '../../../api/commerce/search/query-suggest/query-suggest-response';
import {
  QuerySuggestRequest,
} from '../../../api/commerce/search/query-suggest/query-suggest-request';
import {idDefinition} from '../../query-suggest/query-suggest-actions';

export type StateNeededByQuerySuggest = ConfigurationSection &
  CommerceContextSection &
  CartSection &
  QuerySetSection &
  CommerceQuerySection &
  Partial<
    VersionSection
  >;

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
    const response = await apiClient.querySuggest(
      request
    );

    if (isErrorResponse(response)) {
      return rejectWithValue(response.error);
    }

    response.success.completions = [
      {
        expression : "life",
        highlighted : "{l}[ife]",
      }, {
        expression : "life jacket",
        highlighted : "{l}[ife] [jacket]",
      }, {
        expression : "lock surf",
        highlighted : "{l}[ock] [surf]",
      }, {
        expression : "life jacket boat",
        highlighted : "{l}[ife] [jacket] [boat]",
      }, {
        expression : "lock",
        highlighted : "{l}[ock]",
      }
    ]

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
  const {view, user, ...restOfContext} = state.commerceContext;
  return {
    accessToken: state.configuration.accessToken,
    url: state.configuration.platformUrl,
    organizationId: state.configuration.organizationId,
    query: state.querySet[id],
    ...restOfContext,
    context: {
      user,
      view,
      cart: state.cart.cartItems.map((id) => state.cart.cart[id]),
    },
  };
};

