import {PayloadAction} from '@reduxjs/toolkit';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {facetOrderReducer as facetOrder} from '../../facets/facet-order/facet-order-slice';
import {commerceFacetSetReducer as commerceFacetSet} from '../facets/facet-set/facet-set-slice';
import {paginationReducer as commercePagination} from '../pagination/pagination-slice';
import {queryReducer as query} from '../query/query-slice';
import {sortReducer as commerceSort} from '../sort/sort-slice';
import {
  CommerceSearchParameters,
  restoreSearchParameters,
} from './search-parameters-actions';

/**
 * The search parameters action creators.
 */
export interface SearchParametersActionCreators {
  /**
   * Restores the search parameters.
   *
   * @returns A dispatchable action.
   */
  restoreSearchParameters(
    parameters: CommerceSearchParameters
  ): PayloadAction<CommerceSearchParameters>;
}

/**
 * Loads the search parameters reducer and returns the possible action creators.
 *
 * @param engine - The headless commerce engine.
 * @returns An object holding the action creators.
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
 */
export function loadSearchParametersActions(
  engine: CommerceEngine
): SearchParametersActionCreators {
  engine.addReducers({
    query,
    commerceSort,
    facetOrder,
    commerceFacetSet,
    commercePagination,
  });

  return {
    restoreSearchParameters,
  };
}
