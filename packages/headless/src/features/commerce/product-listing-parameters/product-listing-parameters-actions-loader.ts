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
 * Loads the product listing parameters reducers and returns the possible action creators.
 *
 * @param engine - The headless commerce engine.
 * @returns An object holding the action creators.
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
 */
export function loadProductListingParametersActions(
  engine: CommerceEngine
): ProductListingParametersActionCreators {
  engine.addReducers({
    commerceSort,
    facetOrder,
    commerceFacetSet,
    commercePagination,
  });

  return {
    restoreProductListingParameters,
  };
}
