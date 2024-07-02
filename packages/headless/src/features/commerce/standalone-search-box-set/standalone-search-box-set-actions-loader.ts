import {AsyncThunkAction, PayloadAction} from '@reduxjs/toolkit';
import {AsyncThunkCommerceOptions} from '../../../api/commerce/commerce-api-client';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {standaloneSearchBoxSetReducer as standaloneSearchBoxSet} from '../../standalone-search-box-set/standalone-search-box-set-slice';
import {
  FetchRedirectUrlPayload,
  RegisterStandaloneSearchBoxPayload,
  ResetStandaloneSearchBoxPayload,
  StateNeededForRedirect,
  fetchRedirectUrl,
  registerStandaloneSearchBox,
  resetStandaloneSearchBox,
} from './standalone-search-box-set-actions';

export type {
  FetchRedirectUrlPayload,
  RegisterStandaloneSearchBoxPayload,
  ResetStandaloneSearchBoxPayload,
};

/**
 * The standalone search box set action creators.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
 */
export interface StandaloneSearchBoxSetActionCreators {
  /**
   * Preprocesses the query for the current headless state, and retrieves a redirection URL if a redirect trigger was fired in the query pipeline.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  fetchRedirectUrl(
    payload: FetchRedirectUrlPayload
  ): AsyncThunkAction<
    string,
    FetchRedirectUrlPayload,
    AsyncThunkCommerceOptions<StateNeededForRedirect>
  >;

  /**
   * Registers a standalone search box.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  registerStandaloneSearchBox(
    payload: RegisterStandaloneSearchBoxPayload
  ): PayloadAction<RegisterStandaloneSearchBoxPayload>;

  /**
   * Resets the standalone search box state. To be dispatched on single page applications after the redirection has been triggered.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  resetStandaloneSearchBox(
    payload: ResetStandaloneSearchBoxPayload
  ): PayloadAction<ResetStandaloneSearchBoxPayload>;
}

/**
 * Loads the commerce standalone search box set reducer and returns the available standalone search box set action creators.
 *
 * @param engine - The headless commerce engine.
 * @returns An object holding the standalone search box set action creators.
 */
export function loadStandaloneSearchBoxSetActions(
  engine: CommerceEngine
): StandaloneSearchBoxSetActionCreators {
  engine.addReducers({standaloneSearchBoxSet});
  return {
    fetchRedirectUrl,
    registerStandaloneSearchBox,
    resetStandaloneSearchBox,
  };
}
