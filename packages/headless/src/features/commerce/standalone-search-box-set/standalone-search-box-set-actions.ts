import {StringValue} from '@coveo/bueno';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {
  AsyncThunkCommerceOptions,
  isErrorResponse,
} from '../../../api/commerce/commerce-api-client';
import {CommerceSearchRequest} from '../../../api/commerce/search/request';
import {isRedirectTrigger} from '../../../api/common/trigger';
import {NavigatorContext} from '../../../app/navigatorContextProvider';
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
}

export const registerStandaloneSearchBox = createAction(
  'commerce/standaloneSearchBox/register',
  (payload: RegisterStandaloneSearchBoxPayload) =>
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
