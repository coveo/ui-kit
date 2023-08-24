import {AsyncThunkAction} from '@reduxjs/toolkit';
import {AsyncThunkProductListingV2Options} from '../../../api/commerce/product-listings/v2/product-listing-v2-api-client';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {productListingV2Reducer as productListing} from '../../../features/product-listing/v2/product-listing-v2-slice';
import {ProductListingAction} from '../../analytics/analytics-utils';
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
} from '../../facets/facet-set/facet-set-product-listing-analytics-actions';
import {
  FetchProductListingV2ThunkReturn,
  fetchProductListing,
  StateNeededByFetchProductListingV2,
} from './product-listing-v2-actions';

/**
 * The product listings action creators.
 */
export interface ProductListingActionCreators {
  /**
   * Refreshes the product listing.
   *
   * @returns A dispatchable action.
   */
  fetchProductListing(): AsyncThunkAction<
    FetchProductListingV2ThunkReturn,
    void,
    AsyncThunkProductListingV2Options<StateNeededByFetchProductListingV2>
  >;
}

/**
 * Loads the `productListing` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
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
 */
export interface ProductListingAnalyticsActionCreators {
  /**
   * The event to log when all selected values in a facet are deselected.
   *
   * @param facetId - The facet id.
   * @returns A dispatchable action.
   */
  logFacetClearAll(facetId: string): ProductListingAction;

  /**
   * The event to log when a selected facet value is deselected.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logFacetDeselect(
    payload: LogFacetDeselectActionCreatorPayload
  ): ProductListingAction;

  /**
   * The event to log when an idle facet value is selected.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logFacetSelect(
    payload: LogFacetSelectActionCreatorPayload
  ): ProductListingAction;

  /**
   * The event to log when shrinking a facet to show fewer values.
   *
   * @param facetId - The facet id.
   * @returns A dispatchable action.
   */
  logFacetShowLess(facetId: string): ProductListingAction;

  /**
   * The event to log when expanding a facet to show more values.
   *
   * @param facetId - The facet id.
   * @returns A dispatchable action.
   */
  logFacetShowMore(facetId: string): ProductListingAction;

  /**
   * The event to log when the facet sort criterion is changed.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logFacetUpdateSort(
    payload: LogFacetUpdateSortActionCreatorPayload
  ): ProductListingAction;
}

/**
 * Returns possible product listing analytics action creators.
 *
 * @param engine - The product listing engine.
 * @returns An object holding the action creators.
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
