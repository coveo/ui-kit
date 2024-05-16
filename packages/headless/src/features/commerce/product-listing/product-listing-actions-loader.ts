import {AsyncThunkAction} from '@reduxjs/toolkit';
import {AsyncThunkCommerceOptions} from '../../../api/commerce/commerce-api-client';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {productListingV2Reducer as productListing} from '../../../features/commerce/product-listing/product-listing-slice';
import {ProductListingV2Action} from '../../analytics/analytics-utils';
import {
  logFacetClearAll,
  logFacetDeselect,
  logFacetSelect,
  logFacetShowLess,
  logFacetShowMore,
  logFacetUpdateSort,
  LogFacetDeselectActionCreatorPayload,
  LogFacetSelectActionCreatorPayload,
  LogFacetUpdateSortActionCreatorPayload,
} from '../../facets/facet-set/facet-set-product-listing-v2-analytics-actions';
import {
  QueryCommerceAPIThunkReturn,
  StateNeededByQueryCommerceAPI,
} from '../common/actions';
import {fetchProductListing} from './product-listing-actions';

/**
 * The product listing action creators.
 *
 * @internal open beta
 */
export interface ProductListingActionCreators {
  /**
   * Refreshes the product listing.
   *
   * @returns A dispatchable action.
   */
  fetchProductListing(): AsyncThunkAction<
    QueryCommerceAPIThunkReturn,
    void,
    AsyncThunkCommerceOptions<StateNeededByQueryCommerceAPI>
  >;
}

/**
 * Loads the product listing reducer and returns the possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 * @internal open beta
 */
export function loadProductListingActions(
  engine: CommerceEngine
): ProductListingActionCreators {
  engine.addReducers({productListing});

  return {
    fetchProductListing,
  };
}

/**
 * The product listing analytics action creators.
 *
 * @internal open beta
 */
export interface ProductListingAnalyticsActionCreators {
  /**
   * The event to log when all selected values in a facet are deselected.
   *
   * @param facetId - The facet ID.
   * @returns A dispatchable action.
   */
  logFacetClearAll(facetId: string): ProductListingV2Action;

  /**
   * The event to log when a selected facet value is deselected.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logFacetDeselect(
    payload: LogFacetDeselectActionCreatorPayload
  ): ProductListingV2Action;

  /**
   * The event to log when an idle facet value is selected.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logFacetSelect(
    payload: LogFacetSelectActionCreatorPayload
  ): ProductListingV2Action;

  /**
   * The event to log when collapsing a facet to show fewer values.
   *
   * @param facetId - The facet id.
   * @returns A dispatchable action.
   */
  logFacetShowLess(facetId: string): ProductListingV2Action;

  /**
   * The event to log when expanding a facet to show more values.
   *
   * @param facetId - The facet id.
   * @returns A dispatchable action.
   */
  logFacetShowMore(facetId: string): ProductListingV2Action;

  /**
   * The event to log when the facet sort criterion is changed.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logFacetUpdateSort(
    payload: LogFacetUpdateSortActionCreatorPayload
  ): ProductListingV2Action;
}

/**
 * Returns the possible product listing analytics action creators.
 *
 * @param engine - The product listing engine.
 * @returns An object holding the action creators.
 * @internal open beta
 */
export function loadProductListingAnalyticsActions(
  engine: CommerceEngine
): ProductListingAnalyticsActionCreators {
  engine.addReducers({});

  return {
    logFacetClearAll,
    logFacetDeselect,
    logFacetSelect,
    logFacetShowLess,
    logFacetShowMore,
    logFacetUpdateSort,
  };
}
