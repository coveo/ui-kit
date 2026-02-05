import {BooleanValue, StringValue} from '@coveo/bueno';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {
  type AsyncThunkCommerceOptions,
  isErrorResponse,
} from '../../../api/commerce/commerce-api-client.js';
import type {CommercePlanRequest} from '../../../api/commerce/search/plan/plan-request.js';
import type {NavigatorContext} from '../../../app/navigator-context-provider.js';
import type {CommerceQuerySection} from '../../../state/state-sections.js';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../../utils/validate-payload.js';
import {
  buildBaseCommerceAPIRequest,
  type StateNeededForBaseCommerceAPIRequest,
} from '../common/base-commerce-api-request-builder.js';

export type StateNeededForPlanCommerceAPIRequest =
  StateNeededForBaseCommerceAPIRequest & CommerceQuerySection;

export interface FetchRedirectUrlPayload {
  /**
   * The standalone search box id.
   */
  id: string;
}

export const fetchRedirectUrl = createAsyncThunk<
  string,
  FetchRedirectUrlPayload,
  AsyncThunkCommerceOptions<StateNeededForPlanCommerceAPIRequest>
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

    return response.success.redirect || '';
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

interface UpdateStandaloneSearchBoxPayload {
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
  state: StateNeededForPlanCommerceAPIRequest,
  navigatorContext: NavigatorContext
): CommercePlanRequest => {
  const baseRequest = buildBaseCommerceAPIRequest(state, navigatorContext);
  return {
    ...baseRequest,
    context: {
      ...baseRequest.context,
      capture: false,
    },
    query: state.commerceQuery.query,
  };
};
