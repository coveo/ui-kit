import {PayloadAction} from '@reduxjs/toolkit';
import {CoreEngine} from '../../app/engine.js';
import {facetOrderReducer as facetOrder} from '../facets/facet-order/facet-order-slice.js';
import {facetSetReducer as facetSet} from '../facets/facet-set/facet-set-slice.js';
import {paginationReducer as pagination} from '../pagination/pagination-slice.js';
import {querySetReducer as querySet} from '../query-set/query-set-slice.js';
import {queryReducer as query} from '../query/query-slice.js';
import {sortReducer as sort} from '../sort/sort-slice.js';
import {
  restoreSearchParameters,
  restoreTab,
  SearchParameters,
} from './search-parameter-actions.js';

export type {SearchParameters} from './search-parameter-actions.js';

/**
 * The search parameters action creators.
 *
 * @group Actions
 * @category SearchParameters
 */
export interface SearchParameterActionCreators {
  /**
   * Restores the search parameters.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  restoreSearchParameters(
    payload: SearchParameters
  ): PayloadAction<SearchParameters>;

  /**
   * Restores the tab.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  restoreTab(payload: string): PayloadAction<string>;
}

/**
 * Loads the facet order, facet set, pagination, query, query set, and sort reducers and returns the available search parameters action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the search parameters action creators.
 *
 * @group Actions
 * @category SearchParameters
 */
export function loadSearchParameterActions(
  engine: CoreEngine
): SearchParameterActionCreators {
  engine.addReducers({
    facetOrder,
    facetSet,
    pagination,
    query,
    querySet,
    sort,
  });

  return {
    restoreSearchParameters,
    restoreTab,
  };
}
