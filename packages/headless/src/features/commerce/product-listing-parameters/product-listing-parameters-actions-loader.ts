import type {PayloadAction} from '@reduxjs/toolkit';
import type {CommerceEngine} from '../../../app/commerce-engine/commerce-engine.js';
import {facetOrderReducer as facetOrder} from '../../facets/facet-order/facet-order-slice.js';
import {commerceFacetSetReducer as commerceFacetSet} from '../facets/facet-set/facet-set-slice.js';
import {paginationReducer as commercePagination} from '../pagination/pagination-slice.js';
import {sortReducer as commerceSort} from '../sort/sort-slice.js';
import {
  type RestoreProductListingParametersPayload,
  restoreProductListingParameters,
} from './product-listing-parameters-actions.js';

export type {RestoreProductListingParametersPayload};

/**
 * The product listing parameters action creators.
 *
 * @group Actions
 * @category ProductListingParameters
 */
export interface ProductListingParametersActionCreators {
  /**
   * Restores the product listing parameters.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  restoreProductListingParameters(
    payload: RestoreProductListingParametersPayload
  ): PayloadAction<RestoreProductListingParametersPayload>;
}

/**
 * Loads the commerce facet order, facet set, pagination, and sort reducers and returns the available product listing parameters action creators.
 *
 * @param engine - The headless commerce engine.
 * @returns An object holding the product listing parameters action creators.
 *
 * @group Actions
 * @category ProductListingParameters
 */
export function loadProductListingParametersActions(
  engine: CommerceEngine
): ProductListingParametersActionCreators {
  engine.addReducers({
    facetOrder,
    commerceFacetSet,
    commercePagination,
    commerceSort,
  });

  return {
    restoreProductListingParameters,
  };
}
