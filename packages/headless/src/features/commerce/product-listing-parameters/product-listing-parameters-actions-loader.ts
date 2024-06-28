import {PayloadAction} from '@reduxjs/toolkit';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {facetOrderReducer as facetOrder} from '../../facets/facet-order/facet-order-slice';
import {commerceFacetSetReducer as commerceFacetSet} from '../facets/facet-set/facet-set-slice';
import {paginationReducer as commercePagination} from '../pagination/pagination-slice';
import {sortReducer as commerceSort} from '../sort/sort-slice';
import {
  RestoreProductListingParametersActionCreatorPayload,
  restoreProductListingParameters,
} from './product-listing-parameters-actions';

export type {RestoreProductListingParametersActionCreatorPayload};

/**
 * The product listing parameters action creators.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
 */
export interface ProductListingParametersActionCreators {
  /**
   * Restores the product listing parameters.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  restoreProductListingParameters(
    payload: RestoreProductListingParametersActionCreatorPayload
  ): PayloadAction<RestoreProductListingParametersActionCreatorPayload>;
}

/**
 * Loads the commerce facet order, facet set, pagination, and sort reducers and returns the available product listing parameters action creators.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
 *
 * @param engine - The headless commerce engine.
 * @returns An object holding the product listing parameters action creators.
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
