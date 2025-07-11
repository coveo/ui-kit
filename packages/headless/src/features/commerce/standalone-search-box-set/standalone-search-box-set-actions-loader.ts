import type {AsyncThunkAction, PayloadAction} from '@reduxjs/toolkit';
import type {AsyncThunkCommerceOptions} from '../../../api/commerce/commerce-api-client.js';
import type {CommerceEngine} from '../../../app/commerce-engine/commerce-engine.js';
import {standaloneSearchBoxSetReducer as standaloneSearchBoxSet} from '../../standalone-search-box-set/standalone-search-box-set-slice.js';
import type {StateNeededForPlanCommerceAPIRequest} from './plan-request-builder.js';
import {
  type FetchRedirectUrlPayload,
  fetchRedirectUrl,
  type RegisterStandaloneSearchBoxPayload,
  type ResetStandaloneSearchBoxPayload,
  registerStandaloneSearchBox,
  resetStandaloneSearchBox,
  updateStandaloneSearchBoxRedirectionUrl,
} from './standalone-search-box-set-actions.js';

export type {
  FetchRedirectUrlPayload,
  RegisterStandaloneSearchBoxPayload,
  ResetStandaloneSearchBoxPayload,
};

/**
 * The commerce standalone search box set action creators.
 *
 * @group Actions
 * @category StandaloneSearchBoxSet
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
    AsyncThunkCommerceOptions<StateNeededForPlanCommerceAPIRequest>
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

  /**
   * Updates the redirection URL of the standalone search box.
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateStandaloneSearchBoxRedirectionUrl(
    payload: RegisterStandaloneSearchBoxPayload
  ): PayloadAction<RegisterStandaloneSearchBoxPayload>;
}

/**
 * Loads the standalone search box set reducer and returns the available commerce standalone search box set action creators.
 *
 * @param engine - The headless commerce engine.
 * @returns An object holding the commerce standalone search box set action creators.
 *
 * @group Actions
 * @category StandaloneSearchBoxSet
 */
export function loadStandaloneSearchBoxSetActions(
  engine: CommerceEngine
): StandaloneSearchBoxSetActionCreators {
  engine.addReducers({standaloneSearchBoxSet});
  return {
    fetchRedirectUrl,
    registerStandaloneSearchBox,
    updateStandaloneSearchBoxRedirectionUrl,
    resetStandaloneSearchBox,
  };
}
