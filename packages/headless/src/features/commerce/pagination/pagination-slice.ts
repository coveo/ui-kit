import {createReducer} from '@reduxjs/toolkit';
import {setContext, setView} from '../context/context-actions.js';
import {toggleSelectCategoryFacetValue} from '../facets/category-facet/category-facet-actions.js';
import {
  clearAllCoreFacets,
  deselectAllValuesInCoreFacet,
} from '../facets/core-facet/core-facet-actions.js';
import {
  toggleExcludeDateFacetValue,
  toggleSelectDateFacetValue,
} from '../facets/date-facet/date-facet-actions.js';
import {toggleSelectLocationFacetValue} from '../facets/location-facet/location-facet-actions.js';
import {
  toggleExcludeNumericFacetValue,
  toggleSelectNumericFacetValue,
} from '../facets/numeric-facet/numeric-facet-actions.js';
import {
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
} from '../facets/regular-facet/regular-facet-actions.js';
import type {Parameters} from '../parameters/parameters-actions.js';
import {fetchProductListing} from '../product-listing/product-listing-actions.js';
import {restoreProductListingParameters} from '../product-listing-parameters/product-listing-parameters-actions.js';
import {fetchRecommendations} from '../recommendations/recommendations-actions.js';
import {executeSearch} from '../search/search-actions.js';
import {restoreSearchParameters} from '../search-parameters/search-parameters-actions.js';
import {applySort} from '../sort/sort-actions.js';
import {
  nextPage,
  previousPage,
  registerRecommendationsSlotPagination,
  selectPage,
  setPageSize,
} from './pagination-actions.js';
import {
  type CommercePaginationState,
  getCommercePaginationInitialSlice,
  getCommercePaginationInitialState,
} from './pagination-state.js';

export const paginationReducer = createReducer(
  getCommercePaginationInitialState(),
  (builder) => {
    builder
      .addCase(nextPage, (state, action) => {
        const slice = getEffectiveSlice(state, action.payload?.slotId);

        if (!slice) {
          return;
        }

        if (slice.page < slice.totalPages - 1) {
          ++slice.page;
        }
      })
      .addCase(previousPage, (state, action) => {
        const slice = getEffectiveSlice(state, action.payload?.slotId);

        if (!slice) {
          return;
        }

        if (slice.page > 0) {
          --slice.page;
        }
      })
      .addCase(selectPage, (state, action) => {
        const slice = getEffectiveSlice(state, action.payload.slotId);

        if (!slice) {
          return;
        }

        if (
          action.payload.page >= 0 &&
          action.payload.page < slice.totalPages
        ) {
          slice.page = action.payload.page;
        }
      })
      .addCase(setPageSize, (state, action) => {
        const slice = getEffectiveSlice(state, action.payload.slotId);

        if (!slice) {
          return;
        }

        slice.page = 0;
        slice.perPage = action.payload.pageSize;
      })
      .addCase(fetchProductListing.fulfilled, (state, action) => {
        state.principal = action.payload.response.pagination;
      })
      .addCase(executeSearch.fulfilled, (state, action) => {
        state.principal = action.payload.response.pagination;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.recommendations[action.meta.arg.slotId] =
          action.payload.response.pagination;
      })
      .addCase(registerRecommendationsSlotPagination, (state, action) => {
        const slotId = action.payload.slotId;

        if (slotId in state.recommendations) {
          return;
        }

        state.recommendations[slotId] = getCommercePaginationInitialSlice();
      })
      .addCase(clearAllCoreFacets, handlePaginationReset)
      .addCase(deselectAllValuesInCoreFacet, handlePaginationReset)
      .addCase(toggleSelectFacetValue, handlePaginationReset)
      .addCase(toggleExcludeFacetValue, handlePaginationReset)
      .addCase(toggleSelectLocationFacetValue, handlePaginationReset)
      .addCase(toggleSelectNumericFacetValue, handlePaginationReset)
      .addCase(toggleExcludeNumericFacetValue, handlePaginationReset)
      .addCase(toggleSelectDateFacetValue, handlePaginationReset)
      .addCase(toggleExcludeDateFacetValue, handlePaginationReset)
      .addCase(toggleSelectCategoryFacetValue, handlePaginationReset)
      .addCase(applySort, handlePaginationReset)
      .addCase(setContext, handlePaginationReset)
      .addCase(setView, handlePaginationReset)
      .addCase(restoreSearchParameters, handleRestoreParameters)
      .addCase(restoreProductListingParameters, handleRestoreParameters);
  }
);

function getEffectiveSlice(
  state: CommercePaginationState,
  solutionTypeId: string | undefined
) {
  return solutionTypeId
    ? state.recommendations[solutionTypeId]
    : state.principal;
}

function handlePaginationReset(state: CommercePaginationState) {
  state.principal.page = getCommercePaginationInitialSlice().page;
}

function handleRestoreParameters(
  state: CommercePaginationState,
  action: {payload: Parameters}
) {
  if (action.payload.page) {
    state.principal.page = action.payload.page;
  } else {
    state.principal.page = getCommercePaginationInitialSlice().page;
  }

  if (action.payload.perPage) {
    state.principal.perPage = action.payload.perPage;
  }
}
