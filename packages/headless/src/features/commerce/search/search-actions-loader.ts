import {AsyncThunkAction} from '@reduxjs/toolkit';
import {AsyncThunkCommerceOptions} from '../../../api/commerce/commerce-api-client';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {commerceFacetSetReducer as commerceFacetSet} from '../facets/facet-set/facet-set-slice';
import {paginationReducer as commercePagination} from '../pagination/pagination-slice';
import {
  PrepareForSearchWithQueryActionCreatorPayload,
  QuerySearchCommerceAPIThunkReturn,
  executeSearch,
  fetchMoreProducts,
  prepareForSearchWithQuery,
} from './search-actions';
import {StateNeededByExecuteSearch} from './search-actions-thunk-processor';
import {commerceSearchReducer as commerceSearch} from './search-slice';

export type {PrepareForSearchWithQueryActionCreatorPayload};

/**
 * The search action creators.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
 */
export interface SearchActionCreators {
  /**
   * Updates the query, resets the pagination, and optionally clears all facets in preparation for a new search query.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  prepareForSearchWithQuery(
    payload: PrepareForSearchWithQueryActionCreatorPayload
  ): AsyncThunkAction<
    void,
    PrepareForSearchWithQueryActionCreatorPayload,
    AsyncThunkCommerceOptions<StateNeededByExecuteSearch>
  >;
  /**
   * Executes a search requests.
   *
   * @returns A dispatchable action.
   */
  executeSearch(): AsyncThunkAction<
    QuerySearchCommerceAPIThunkReturn,
    void,
    AsyncThunkCommerceOptions<StateNeededByExecuteSearch>
  >;

  /**
   * Fetches and additional page of products and apprends it to the current list.
   *
   * @returns A dispatchable action.
   */
  fetchMoreProducts(): AsyncThunkAction<
    QuerySearchCommerceAPIThunkReturn | null,
    void,
    AsyncThunkCommerceOptions<StateNeededByExecuteSearch>
  >;

  // TODO KIT-3221 - Expose promoteChildToParent action and action payload creator.
}

/**
 * Loads the commerce search, pagination, and facet set reducers and returns the possible commerce search action creators.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
 *
 * @param engine - The headless commerce engine.
 * @returns An object holding the commerce search action creators.
 */
export function loadSearchActions(
  engine: CommerceEngine
): SearchActionCreators {
  engine.addReducers({
    commerceSearch,
    commercePagination,
    commerceFacetSet,
  });

  return {
    prepareForSearchWithQuery,
    executeSearch,
    fetchMoreProducts,
  };
}
