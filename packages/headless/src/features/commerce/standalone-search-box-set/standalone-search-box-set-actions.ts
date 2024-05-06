import {StringValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {
  CommerceContextSection,
  CommerceQuerySection,
  ConfigurationSection,
  PipelineSection,
  SearchHubSection,
} from '../../../state/state-sections';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../../utils/validate-payload';

export type StateNeededForRedirect = ConfigurationSection &
  CommerceQuerySection &
  Partial<CommerceContextSection & SearchHubSection & PipelineSection>;

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
  /**
   *  TODO: KIT-3134: remove once the `search/redirect` endpoint is implemented.
   * This is a temporary hack to simulate the redirection URL. It will be removed once the `search/redirect` endpoint is implemented.
   */
  redirectionUrl: string;
}

export const fetchRedirectUrl = createAction(
  // TODO: KIT-3134: implement createAsyncThunk logic to fetch the redirection URL from the Commerce API endpoint.
  'commerce/standaloneSearchBox/fetchRedirect',
  (payload: FetchRedirectUrlActionCreatorPayload) =>
    validatePayload(payload, {
      id: new StringValue({emptyAllowed: false}),
      redirectionUrl: new StringValue({emptyAllowed: false}),
    })
);
