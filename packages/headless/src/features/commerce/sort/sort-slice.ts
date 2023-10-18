import {createReducer} from '@reduxjs/toolkit';
import {applySort} from './sort-actions';
import {getCommerceSortInitialState} from './sort-state';
import {fetchProductListing} from '../product-listing/product-listing-actions';
import {SortOption} from '../../../api/commerce/product-listings/v2/sort';
import {
  buildRelevanceSortCriterion,
  SortBy,
  SortCriterion,
} from '../../sort/sort';

const sortResponseToSort = (sort: SortOption): SortCriterion => {
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
        (state.appliedSort = sortResponseToSort(response.sort.appliedSort)),
          (state.availableSorts =
            response.sort.availableSorts.map(sortResponseToSort));
      });
  }
);
