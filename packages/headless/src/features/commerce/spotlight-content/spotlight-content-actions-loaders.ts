import type {AsyncThunkAction} from '@reduxjs/toolkit';
import type {AsyncThunkCommerceOptions} from '../../../api/commerce/commerce-api-client.js';
import type {CommerceEngineState} from '../../../app/commerce-engine/commerce-engine.js';
import {
  type SpotlightContentClickPayload,
  spotlightContentClick,
} from './spotlight-content-actions.js';

export type {SpotlightContentClickPayload};

/**
 * The spotlight content action creators.
 *
 * @group Actions
 * @category SpotlightContent
 */
export interface SpotlightContentActionCreators {
  /**
   * Logs a click analytics event for a spotlight content item.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  spotlightContentClick(
    payload: SpotlightContentClickPayload
  ): AsyncThunkAction<
    void,
    SpotlightContentClickPayload,
    AsyncThunkCommerceOptions<CommerceEngineState>
  >;
}

/**
 * Returns the possible spotlight content action creators.
 *
 * @returns An object holding the action creators.
 *
 * @group Actions
 * @category SpotlightContent
 */
export function loadSpotlightContentActions(): SpotlightContentActionCreators {
  return {
    spotlightContentClick,
  };
}
