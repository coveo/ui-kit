import {AsyncThunkAction, PayloadAction} from '@reduxjs/toolkit';
import {AsyncThunkCommerceOptions} from '../../../api/commerce/commerce-api-client.js';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine.js';
import {StateNeededByExecuteSearch} from './search-actions-thunk-processor.js';
import {
  PrepareForSearchWithQueryPayload,
  PromoteChildToParentPayload,
  QuerySearchCommerceAPIThunkReturn,
  executeSearch,
  fetchMoreProducts,
  prepareForSearchWithQuery,
  promoteChildToParent,
} from './search-actions.js';
import {commerceSearchReducer as commerceSearch} from './search-slice.js';

export type {PrepareForSearchWithQueryPayload};

/**
 * The search action creators.
 */
export interface SearchActionCreators {
  /**
   * Executes a search query.
   *
   * @returns A dispatchable action.
   */
  executeSearch(): AsyncThunkAction<
    QuerySearchCommerceAPIThunkReturn,
    void,
    AsyncThunkCommerceOptions<StateNeededByExecuteSearch>
  >;

  /**
   * Fetches and additional page of products and appends it to the current list.
   *
   * @returns A dispatchable action.
   */
  fetchMoreProducts(): AsyncThunkAction<
    QuerySearchCommerceAPIThunkReturn | null,
    void,
    AsyncThunkCommerceOptions<StateNeededByExecuteSearch>
  >;

  /**
   * Updates the query, resets the pagination, and optionally clears all facets in preparation for a new search query.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  prepareForSearchWithQuery(
    payload: PrepareForSearchWithQueryPayload
  ): AsyncThunkAction<
    void,
    PrepareForSearchWithQueryPayload,
    AsyncThunkCommerceOptions<StateNeededByExecuteSearch>
  >;

  /**
   * Promotes a child product to a parent product.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  promoteChildToParent(
    payload: PromoteChildToParentPayload
  ): PayloadAction<PromoteChildToParentPayload>;
}

/**
 * Loads the commerce search reducer and returns the available search action creators.
 *
 * @param engine - The headless commerce engine.
 * @returns An object holding the search action creators.
 */
export function loadSearchActions(
  engine: CommerceEngine
): SearchActionCreators {
  engine.addReducers({commerceSearch});

  return {
    executeSearch,
    fetchMoreProducts,
    prepareForSearchWithQuery,
    promoteChildToParent,
  };
}
