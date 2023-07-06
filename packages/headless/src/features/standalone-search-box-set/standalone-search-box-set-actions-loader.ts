import {AsyncThunkAction, PayloadAction} from '@reduxjs/toolkit';
import {AsyncThunkSearchOptions} from '../../api/search/search-api-client';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {standaloneSearchBoxSetReducer as standaloneSearchBoxSet} from '../../features/standalone-search-box-set/standalone-search-box-set-slice';
import {
  registerStandaloneSearchBox,
  RegisterStandaloneSearchBoxActionCreatorPayload,
  fetchRedirectUrl,
  FetchRedirectUrlActionCreatorPayload,
  updateAnalyticsToSearchFromLink,
  UpdateAnalyticsToSearchFromLinkActionCreatorPayload,
  updateAnalyticsToOmniboxFromLink,
  UpdateAnalyticsToOmniboxFromLinkActionCreatorPayload,
  StateNeededForRedirect,
  resetStandaloneSearchBox,
  ResetStandaloneSearchBoxActionCreatorPayload,
} from './standalone-search-box-set-actions';

export type {
  RegisterStandaloneSearchBoxActionCreatorPayload,
  ResetStandaloneSearchBoxActionCreatorPayload,
  FetchRedirectUrlActionCreatorPayload,
  UpdateAnalyticsToSearchFromLinkActionCreatorPayload,
  UpdateAnalyticsToOmniboxFromLinkActionCreatorPayload,
};

/**
 * The standalone search box set action creators.
 */
export interface StandaloneSearchBoxSetActionCreators {
  /**
   * Registers a standalone search box.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  registerStandaloneSearchBox(
    payload: RegisterStandaloneSearchBoxActionCreatorPayload
  ): PayloadAction<RegisterStandaloneSearchBoxActionCreatorPayload>;

  /**
   * Resets the standalone search box state. To be dispatched on single page applications after the redirection has been triggered.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  resetStandaloneSearchBox(
    payload: ResetStandaloneSearchBoxActionCreatorPayload
  ): PayloadAction<ResetStandaloneSearchBoxActionCreatorPayload>;

  /**
   * Preprocesses the query for the current headless state, and retrieves a redirection URL if a redirect trigger was fired in the query pipeline.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  fetchRedirectUrl(
    payload: FetchRedirectUrlActionCreatorPayload
  ): AsyncThunkAction<
    string,
    FetchRedirectUrlActionCreatorPayload,
    AsyncThunkSearchOptions<StateNeededForRedirect>
  >;

  /**
   * Updates the standalone search box analytics data to reflect a search submitted using the search box.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateAnalyticsToSearchFromLink(
    payload: UpdateAnalyticsToSearchFromLinkActionCreatorPayload
  ): PayloadAction<UpdateAnalyticsToSearchFromLinkActionCreatorPayload>;

  /**
   * Updates the standalone search box analytics data to reflect a search submitted by selecting a query suggestion.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateAnalyticsToOmniboxFromLink(
    payload: UpdateAnalyticsToOmniboxFromLinkActionCreatorPayload
  ): PayloadAction<UpdateAnalyticsToOmniboxFromLinkActionCreatorPayload>;
}

/**
 * Loads the `standaloneSearchBoxSet` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadStandaloneSearchBoxSetActions(
  engine: SearchEngine
): StandaloneSearchBoxSetActionCreators {
  engine.addReducers({standaloneSearchBoxSet});

  return {
    registerStandaloneSearchBox,
    fetchRedirectUrl,
    updateAnalyticsToSearchFromLink,
    updateAnalyticsToOmniboxFromLink,
    resetStandaloneSearchBox,
  };
}
