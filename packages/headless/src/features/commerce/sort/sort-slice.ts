import {
  type AnyAction,
  createReducer,
  type Draft as WritableDraft,
} from '@reduxjs/toolkit';
import type {SortOption} from '../../../api/commerce/common/sort.js';
import {
  buildRelevanceSortCriterion,
  SortBy,
  type SortCriterion,
} from '../../sort/sort.js';
import {setContext, setView} from '../context/context-actions.js';
import type {Parameters} from '../parameters/parameters-actions.js';
import {fetchProductListing} from '../product-listing/product-listing-actions.js';
import {restoreProductListingParameters} from '../product-listing-parameters/product-listing-parameters-actions.js';
import {executeSearch} from '../search/search-actions.js';
import {restoreSearchParameters} from '../search-parameters/search-parameters-actions.js';
import {applySort} from './sort-actions.js';
import {
  type CommerceSortState,
  getCommerceSortInitialState,
} from './sort-state.js';

export const sortReducer = createReducer(
  getCommerceSortInitialState(),

  (builder) => {
    builder
      .addCase(applySort, (state, action) => {
        state.appliedSort = action.payload;
      })
      .addCase(fetchProductListing.fulfilled, handleFetchFulfilled)
      .addCase(executeSearch.fulfilled, handleFetchFulfilled)
      .addCase(setContext, getCommerceSortInitialState)
      .addCase(setView, getCommerceSortInitialState)
      .addCase(restoreSearchParameters, handleRestoreParameters)
      .addCase(restoreProductListingParameters, handleRestoreParameters);
  }
);

function handleFetchFulfilled(
  state: WritableDraft<CommerceSortState>,
  action: AnyAction
) {
  const response = action.payload.response;
  state.appliedSort = mapResponseSortToStateSort(response.sort.appliedSort);
  state.availableSorts = response.sort.availableSorts.map(
    mapResponseSortToStateSort
  );
}

const mapResponseSortToStateSort = (sort: SortOption): SortCriterion => {
  if (sort.sortCriteria === SortBy.Relevance) {
    return buildRelevanceSortCriterion();
  }

  return {
    by: SortBy.Fields,
    fields: (sort.fields || []).map(({field, direction, displayName}) => ({
      name: field,
      direction,
      displayName,
    })),
  };
};

function handleRestoreParameters(
  state: WritableDraft<CommerceSortState>,
  action: {payload: Parameters}
) {
  if (action.payload.sortCriteria) {
    state.appliedSort = action.payload.sortCriteria;
    return;
  }

  state.appliedSort = getCommerceSortInitialState().appliedSort;
}
