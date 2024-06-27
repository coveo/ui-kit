import {createReducer} from '@reduxjs/toolkit';
import {deselectAllBreadcrumbs} from '../../breadcrumb/breadcrumb-actions';
import {
  deselectAllFacetValues,
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
} from '../../facets/facet-set/facet-set-actions';
import {
  toggleExcludeNumericFacetValue,
  toggleSelectNumericFacetValue,
} from '../../facets/range-facets/numeric-facet-set/numeric-facet-actions';
import {setContext, setUser, setView} from '../context/context-actions';
import {Parameters} from '../parameters/parameters-actions';
import {restoreProductListingParameters} from '../product-listing-parameters/product-listing-parameters-actions';
import {fetchProductListing} from '../product-listing/product-listing-actions';
import {fetchRecommendations} from '../recommendations/recommendations-actions';
import {restoreSearchParameters} from '../search-parameters/search-parameters-actions';
import {executeSearch} from '../search/search-actions';
import {
  nextPage,
  previousPage,
  registerRecommendationsSlotPagination,
  selectPage,
  setPageSize,
} from './pagination-actions';
import {
  CommercePaginationState,
  getCommercePaginationInitialSlice,
  getCommercePaginationInitialState,
} from './pagination-state';

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

        if (slotId in state) {
          return;
        }

        state.recommendations[slotId] = getCommercePaginationInitialSlice();
      })
      .addCase(restoreSearchParameters, handleRestoreParameters)
      .addCase(restoreProductListingParameters, handleRestoreParameters)
      .addCase(deselectAllBreadcrumbs, handlePaginationReset)
      .addCase(deselectAllFacetValues, handlePaginationReset)
      .addCase(toggleSelectFacetValue, handlePaginationReset)
      .addCase(toggleExcludeFacetValue, handlePaginationReset)
      .addCase(toggleSelectNumericFacetValue, handlePaginationReset)
      .addCase(toggleExcludeNumericFacetValue, handlePaginationReset)
      .addCase(setContext, handlePaginationReset)
      .addCase(setView, handlePaginationReset)
      .addCase(setUser, handlePaginationReset);
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
  }

  if (action.payload.perPage) {
    state.principal.perPage = action.payload.perPage;
  }
}
