import type {AsyncThunkAction} from '@reduxjs/toolkit';
import type {AsyncThunkCommerceOptions} from '../../../api/commerce/commerce-api-client.js';
import type {CommerceEngine} from '../../../app/commerce-engine/commerce-engine.js';
import {
  type FetchBadgesPayload,
  type FetchBadgesThunkReturn,
  fetchBadges,
  type StateNeededByFetchBadges,
} from './product-enrichment-actions.js';
import {productEnrichmentReducer as productEnrichment} from './product-enrichment-slice.js';

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
  };
}
