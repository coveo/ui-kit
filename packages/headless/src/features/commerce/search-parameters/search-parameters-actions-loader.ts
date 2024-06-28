import {PayloadAction} from '@reduxjs/toolkit';
import {
  RestoreSearchParametersActionCreatorPayload,
  restoreSearchParameters,
} from './search-parameters-actions';

export type {RestoreSearchParametersActionCreatorPayload};

/**
 * The search parameters action creators.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
 */
export interface SearchParametersActionCreators {
  /**
   * Restores the search parameters.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  restoreSearchParameters(
    payload: RestoreSearchParametersActionCreatorPayload
  ): PayloadAction<RestoreSearchParametersActionCreatorPayload>;
}

/**
 * Returns the possible search parameters action creators.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
 *
 * @returns An object holding the search parameters action creators.

 */
export function loadSearchParametersActions(): SearchParametersActionCreators {
  return {
    restoreSearchParameters,
  };
}
