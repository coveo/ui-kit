import {StringValue} from '@coveo/bueno';
import {Relay} from '@coveo/relay';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {
  AsyncThunkCommerceOptions,
  isErrorResponse,
} from '../../../api/commerce/commerce-api-client';
import {CommerceSearchRequest} from '../../../api/commerce/search/request';
import {isRedirectTrigger} from '../../../api/common/trigger';
import {
  CartSection,
  CommerceContextSection,
  CommerceQuerySection,
  ConfigurationSection,
} from '../../../state/state-sections';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../../utils/validate-payload';
import {buildBaseCommerceAPIRequest} from '../common/actions';

export type StateNeededForRedirect = ConfigurationSection &
  CommerceContextSection &
  CommerceQuerySection &
  CartSection;

export interface RegisterStandaloneSearchBoxActionCreatorPayload {
  /**
   * The standalone search box id.
   */
  id: string;

  /**
   * The default URL to which to redirect the user.
   */
  redirectionUrl: string;
}

export const registerStandaloneSearchBox = createAction(
  'standaloneSearchBox/register',
  (payload: RegisterStandaloneSearchBoxActionCreatorPayload) =>
    validatePayload(payload, {
      id: requiredNonEmptyString,
      redirectionUrl: requiredNonEmptyString,
    })
);

export interface ResetStandaloneSearchBoxActionCreatorPayload {
  /**
   * The standalone search box id.
   */
  id: string;
}

export const resetStandaloneSearchBox = createAction(
  'standaloneSearchBox/reset',
  (payload: ResetStandaloneSearchBoxActionCreatorPayload) =>
    validatePayload(payload, {
      id: requiredNonEmptyString,
    })
);

export interface FetchRedirectUrlActionCreatorPayload {
  /**
   * The standalone search box id.
   */
  id: string;
}

// eslint-disable-next-line @cspell/spellchecker
// TODO: CAPI-867 - Use Commerce API's equivalent of the /plan endpoint when it becomes available.
export const fetchRedirectUrl = createAsyncThunk<
  string,
  FetchRedirectUrlActionCreatorPayload,
  AsyncThunkCommerceOptions<StateNeededForRedirect>
>(
  'commerce/standaloneSearchBox/fetchRedirect',
  async (payload, {getState, rejectWithValue, extra: {apiClient, relay}}) => {
    validatePayload(payload, {id: new StringValue({emptyAllowed: false})});
    const state = getState();
    const request = await buildPlanRequest(state, relay);
    const response = await apiClient.plan(request);
    if (isErrorResponse(response)) {
      return rejectWithValue(response.error);
    }

    const redirectTriggers =
      response.success.triggers.filter(isRedirectTrigger);

    return redirectTriggers.length ? redirectTriggers[0].content : '';
  }
);

export const buildPlanRequest = async (
  state: StateNeededForRedirect,
  relay: Relay
): Promise<CommerceSearchRequest> => {
  return {
    query: state.commerceQuery.query,
    ...(await buildBaseCommerceAPIRequest(state, relay)),
  };
};
