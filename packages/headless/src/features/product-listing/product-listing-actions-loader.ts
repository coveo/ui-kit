import {AsyncThunkAction, PayloadAction} from '@reduxjs/toolkit';
import {AsyncThunkProductListingOptions} from '../../api/commerce/product-listings/product-listing-api-client';
import {ProductListingEngine} from '../../app/product-listing-engine/product-listing-engine';
import {productListingReducer as productListing} from '../../features/product-listing/product-listing-slice';
import {ProductListingAction} from '../analytics/analytics-utils';
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
} from '../facets/facet-set/facet-set-product-listing-analytics-actions';
import {
  SetProductListingUrlPayload,
  FetchProductListingThunkReturn,
  fetchProductListing,
  setProductListingUrl,
  StateNeededByFetchProductListing,
} from './product-listing-actions';

export type {SetProductListingUrlPayload};

/**
 * The product listings action creators.
 * @deprecated The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
 */
export interface ProductListingActionCreators {
  /**
   * Updates the product listing url field.
   * @deprecated The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  setProductListingUrl(
    payload: SetProductListingUrlPayload
  ): PayloadAction<SetProductListingUrlPayload>;

  /**
   * Refreshes the product listing.
   * @deprecated The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
   *
   * @returns A dispatchable action.
   */
  fetchProductListing(): AsyncThunkAction<
    FetchProductListingThunkReturn,
    void,
    AsyncThunkProductListingOptions<StateNeededByFetchProductListing>
  >;
}

/**
 * Loads the `productListing` reducer and returns possible action creators.
 * @deprecated The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadProductListingActions(
  engine: ProductListingEngine
): ProductListingActionCreators {
  engine.addReducers({productListing});

  return {
    setProductListingUrl,
    fetchProductListing,
  };
}

/**
 * The product listing analytics action creators.
 * @deprecated The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
 */
export interface ProductListingAnalyticsActionCreators {
  /**
   * The event to log when all selected values in a facet are deselected.
   * @deprecated The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
   *
   * @param facetId - The facet id.
   * @returns A dispatchable action.
   */
  logFacetClearAll(facetId: string): ProductListingAction;

  /**
   * The event to log when a selected facet value is deselected.
   * @deprecated The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logFacetDeselect(
    payload: LogFacetDeselectActionCreatorPayload
  ): ProductListingAction;

  /**
   * The event to log when an idle facet value is selected.
   * @deprecated The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logFacetSelect(
    payload: LogFacetSelectActionCreatorPayload
  ): ProductListingAction;

  /**
   * The event to log when shrinking a facet to show fewer values.
   * @deprecated The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
   *
   * @param facetId - The facet id.
   * @returns A dispatchable action.
   */
  logFacetShowLess(facetId: string): ProductListingAction;

  /**
   * The event to log when expanding a facet to show more values.
   * @deprecated The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
   *
   * @param facetId - The facet id.
   * @returns A dispatchable action.
   */
  logFacetShowMore(facetId: string): ProductListingAction;

  /**
   * The event to log when the facet sort criterion is changed.
   * @deprecated The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
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
 * @deprecated The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
 *
 * @param engine - The product listing engine.
 * @returns An object holding the action creators.
 */
export function loadProductListingAnalyticsActions(
  engine: ProductListingEngine
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
