import type {AsyncThunkAction, PayloadAction} from '@reduxjs/toolkit';
import type {AsyncThunkCommerceOptions} from '../../../api/commerce/commerce-api-client.js';
import type {CommerceEngine} from '../../../app/commerce-engine/commerce-engine.js';
import {
  executeSearch,
  type FetchSearchPayload,
  fetchMoreProducts,
  type PrepareForSearchWithQueryPayload,
  type PromoteChildToParentPayload,
  prepareForSearchWithQuery,
  promoteChildToParent,
  type QuerySearchCommerceAPIThunkReturn,
} from './search-actions.js';
import type {StateNeededByExecuteSearch} from './search-actions-thunk-processor.js';
import {commerceSearchReducer as commerceSearch} from './search-slice.js';

export type {PrepareForSearchWithQueryPayload, FetchSearchPayload};

/**
 * The search action creators.
 *
 * @group Actions
 * @category Search
 */
export interface SearchActionCreators {
  /**
   * Executes a search query.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  executeSearch(
    payload?: FetchSearchPayload
  ): AsyncThunkAction<
    QuerySearchCommerceAPIThunkReturn,
    FetchSearchPayload | undefined,
    AsyncThunkCommerceOptions<StateNeededByExecuteSearch>
  >;

  /**
   * Fetches and additional page of products and appends it to the current list.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  fetchMoreProducts(
    payload?: FetchSearchPayload
  ): AsyncThunkAction<
    QuerySearchCommerceAPIThunkReturn | null,
    FetchSearchPayload | undefined,
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
 *
 * @group Actions
 * @category Search
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
