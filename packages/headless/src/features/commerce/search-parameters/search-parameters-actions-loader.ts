import {PayloadAction} from '@reduxjs/toolkit';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {facetOrderReducer as facetOrder} from '../../facets/facet-order/facet-order-slice';
import {querySetReducer as querySet} from '../../query-set/query-set-slice';
import {commerceFacetSetReducer as commerceFacetSet} from '../facets/facet-set/facet-set-slice';
import {paginationReducer as commercePagination} from '../pagination/pagination-slice';
import {queryReducer as query} from '../query/query-slice';
import {sortReducer as commerceSort} from '../sort/sort-slice';
import {
  RestoreSearchParametersActionCreatorPayload,
  restoreSearchParameters,
} from './search-parameters-actions';

export type {RestoreSearchParametersActionCreatorPayload};

/**
 * The search parameters action creators.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
 */
export interface SearchParametersActionCreators {
  /**
   * Restores the search parameters.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  restoreSearchParameters(
    payload: RestoreSearchParametersActionCreatorPayload
  ): PayloadAction<RestoreSearchParametersActionCreatorPayload>;
}

/**
 * Loads the commerce facet order, facet set, pagination, query, query set, and sort reducers and returns the available search parameters action creators.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
 *
 * @param engine - The headless commerce engine.
 * @returns An object holding the search parameters action creators.

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
