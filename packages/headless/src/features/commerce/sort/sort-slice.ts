import {createReducer} from '@reduxjs/toolkit';
import {SortOption} from '../../../api/commerce/common/sort';
import {
  buildRelevanceSortCriterion,
  SortBy,
  SortCriterion,
} from '../../sort/sort';
import {fetchProductListing} from '../product-listing/product-listing-actions';
import {applySort} from './sort-actions';
import {getCommerceSortInitialState} from './sort-state';

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

export const sortReducer = createReducer(
  getCommerceSortInitialState(),

  (builder) => {
    builder
      .addCase(applySort, (state, action) => {
        state.appliedSort = action.payload;
      })
      .addCase(fetchProductListing.fulfilled, (state, action) => {
        const response = action.payload.response;
        state.appliedSort = mapResponseSortToStateSort(
          response.sort.appliedSort
        );
        state.availableSorts = response.sort.availableSorts.map(
          mapResponseSortToStateSort
        );
      });
  }
);
