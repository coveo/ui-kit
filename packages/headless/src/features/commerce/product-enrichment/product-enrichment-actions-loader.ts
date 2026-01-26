import type {AsyncThunkAction, PayloadAction} from '@reduxjs/toolkit';
import type {AsyncThunkCommerceOptions} from '../../../api/commerce/commerce-api-client.js';
import type {CommerceEngine} from '../../../app/commerce-engine/commerce-engine.js';
import {
  type FetchBadgesPayload,
  type FetchBadgesThunkReturn,
  fetchBadges,
  type RegisterProductEnrichmentOptionsPayload,
  registerProductEnrichmentOptions,
  type StateNeededByFetchBadges,
} from './product-enrichment-actions.js';
import {productEnrichmentReducer as productEnrichment} from './product-enrichment-slice.js';

export type {RegisterProductEnrichmentOptionsPayload, FetchBadgesPayload};
/**
 * The product enrichment action creators.
 *
 * @group Actions
 * @category ProductEnrichment
 */
export interface ProductEnrichmentActionCreators {
  /**
   * Fetches the badges.
   *
   * @returns A dispatchable action.
   */
  fetchBadges(
    payload?: FetchBadgesPayload
  ): AsyncThunkAction<
    FetchBadgesThunkReturn,
    FetchBadgesPayload,
    AsyncThunkCommerceOptions<StateNeededByFetchBadges>
  >;

  /**
   * Registers the product enrichment options.
   *
   * @returns A dispatchable action.
   */
  registerProductEnrichmentOptions(
    payload: RegisterProductEnrichmentOptionsPayload
  ): PayloadAction<RegisterProductEnrichmentOptionsPayload>;
}

/**
 * Loads the commerce product enrichment reducer and returns the available product enrichment action creators.
 *
 * @param engine - The headless commerce engine.
 * @returns An object holding the product enrichment action creators.
 *
 * @group Actions
 * @category ProductEnrichment
 */
export function loadProductEnrichmentActions(
  engine: CommerceEngine
): ProductEnrichmentActionCreators {
  engine.addReducers({productEnrichment});

  return {
    fetchBadges,
    registerProductEnrichmentOptions,
  };
}
