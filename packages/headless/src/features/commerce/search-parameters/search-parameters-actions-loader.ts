import type {PayloadAction} from '@reduxjs/toolkit';
import type {CommerceEngine} from '../../../app/commerce-engine/commerce-engine.js';
import {facetOrderReducer as facetOrder} from '../../facets/facet-order/facet-order-slice.js';
import {querySetReducer as querySet} from '../../query-set/query-set-slice.js';
import {commerceFacetSetReducer as commerceFacetSet} from '../facets/facet-set/facet-set-slice.js';
import {paginationReducer as commercePagination} from '../pagination/pagination-slice.js';
import {queryReducer as query} from '../query/query-slice.js';
import {sortReducer as commerceSort} from '../sort/sort-slice.js';
import {
  type RestoreSearchParametersPayload,
  restoreSearchParameters,
} from './search-parameters-actions.js';

export type {RestoreSearchParametersPayload};

/**
 * The search parameters action creators.
 *
 * @group Actions
 * @category SearchParameters
 */
export interface SearchParametersActionCreators {
  /**
   * Restores the search parameters.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  restoreSearchParameters(
    payload: RestoreSearchParametersPayload
  ): PayloadAction<RestoreSearchParametersPayload>;
}

/**
 * Loads the commerce facet order, facet set, pagination, query, query set, and sort reducers and returns the available search parameters action creators.
 *
 * @param engine - The headless commerce engine.
 * @returns An object holding the search parameters action creators.
 *
 * @group Actions
 * @category SearchParameters
 */
export function loadSearchParametersActions(
  engine: CommerceEngine
): SearchParametersActionCreators {
  engine.addReducers({
    facetOrder,
    commerceFacetSet,
    commercePagination,
    query,
    querySet,
    commerceSort,
  });

  return {
    restoreSearchParameters,
  };
}
