import {BooleanValue, StringValue} from '@coveo/bueno';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {
  AsyncThunkCommerceOptions,
  isErrorResponse,
} from '../../../api/commerce/commerce-api-client.js';
import {CommerceSearchRequest} from '../../../api/commerce/search/request.js';
import {isRedirectTrigger} from '../../../api/common/trigger.js';
import {NavigatorContext} from '../../../app/navigatorContextProvider.js';
import {
  CartSection,
  CommerceContextSection,
  CommerceQuerySection,
  CommerceConfigurationSection,
} from '../../../state/state-sections.js';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../../utils/validate-payload.js';
import {buildBaseCommerceAPIRequest} from '../common/actions.js';

export type StateNeededForRedirect = CommerceConfigurationSection &
  CommerceContextSection &
  CommerceQuerySection &
  CartSection;

export interface FetchRedirectUrlPayload {
  /**
   * The standalone search box id.
   */
  id: string;
}

// eslint-disable-next-line @cspell/spellchecker
// TODO: CAPI-867 - Use Commerce API's equivalent of the /plan endpoint when it becomes available.
export const fetchRedirectUrl = createAsyncThunk<
  string,
  FetchRedirectUrlPayload,
  AsyncThunkCommerceOptions<StateNeededForRedirect>
>(
  'commerce/standaloneSearchBox/fetchRedirect',
  async (
    payload,
    {getState, rejectWithValue, extra: {apiClient, navigatorContext}}
  ) => {
    validatePayload(payload, {id: new StringValue({emptyAllowed: false})});
    const state = getState();
    const request = buildPlanRequest(state, navigatorContext);
    const response = await apiClient.plan(request);
    if (isErrorResponse(response)) {
      return rejectWithValue(response.error);
    }

    const redirectTriggers =
      response.success.triggers.filter(isRedirectTrigger);

    return redirectTriggers.length ? redirectTriggers[0].content : '';
  }
);
export interface RegisterStandaloneSearchBoxPayload {
  /**
   * The standalone search box id.
   */
  id: string;

  /**
   * The default URL to which to redirect the user.
   */
  redirectionUrl: string;

  /**
   * Whether to overwrite the existing standalone search box with the same id.
   */
  overwrite?: boolean;
}

export interface UpdateStandaloneSearchBoxPayload {
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
  'commerce/standaloneSearchBox/register',
  (payload: RegisterStandaloneSearchBoxPayload) =>
    validatePayload(payload, {
      id: requiredNonEmptyString,
      redirectionUrl: requiredNonEmptyString,
      overwrite: new BooleanValue({required: false}),
    })
);

export const updateStandaloneSearchBoxRedirectionUrl = createAction(
  'commerce/standaloneSearchBox/updateRedirectionUrl',
  (payload: UpdateStandaloneSearchBoxPayload) =>
    validatePayload(payload, {
      id: requiredNonEmptyString,
      redirectionUrl: requiredNonEmptyString,
    })
);

export interface ResetStandaloneSearchBoxPayload {
  /**
   * The standalone search box id.
   */
  id: string;
}

export const resetStandaloneSearchBox = createAction(
  'commerce/standaloneSearchBox/reset',
  (payload: ResetStandaloneSearchBoxPayload) =>
    validatePayload(payload, {
      id: requiredNonEmptyString,
    })
);

export const buildPlanRequest = (
  state: StateNeededForRedirect,
  navigatorContext: NavigatorContext
): CommerceSearchRequest => {
  return {
    query: state.commerceQuery.query,
    ...buildBaseCommerceAPIRequest(state, navigatorContext),
  };
};
