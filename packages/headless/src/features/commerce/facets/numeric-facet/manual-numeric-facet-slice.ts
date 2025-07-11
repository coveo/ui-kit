import {createReducer} from '@reduxjs/toolkit';
import type {NumericRangeRequest} from '../../../facets/range-facets/numeric-facet-set/interfaces/request.js';
import {restoreProductListingParameters} from '../../product-listing-parameters/product-listing-parameters-actions.js';
import {restoreSearchParameters} from '../../search-parameters/search-parameters-actions.js';
import {
  clearAllCoreFacets,
  deselectAllValuesInCoreFacet,
} from '../core-facet/core-facet-actions.js';
import {
  getManualNumericFacetInitialState,
  type ManualNumericFacetSetState,
} from './manual-numeric-facet-state.js';
import {
  toggleExcludeNumericFacetValue,
  toggleSelectNumericFacetValue,
  updateManualNumericFacetRange,
} from './numeric-facet-actions.js';

export const manualNumericFacetReducer = createReducer(
  getManualNumericFacetInitialState(),
  (builder) =>
    builder
      .addCase(updateManualNumericFacetRange, (state, action) => {
        const {facetId, ...manualRange} = action.payload;
        state[facetId] = {manualRange};
      })
      .addCase(toggleExcludeNumericFacetValue, (state, action) => {
        clearManualRange(state, action.payload.facetId);
      })
      .addCase(toggleSelectNumericFacetValue, (state, action) => {
        clearManualRange(state, action.payload.facetId);
      })
      .addCase(deselectAllValuesInCoreFacet, (state, action) => {
        clearManualRange(state, action.payload.facetId);
      })
      .addCase(restoreSearchParameters, (state, action) => {
        restoreParameters(state, action.payload.mnf);
      })
      .addCase(restoreProductListingParameters, (state, action) => {
        restoreParameters(state, action.payload.mnf);
      })
      .addCase(clearAllCoreFacets, (state) => {
        for (const facetId of Object.keys(state)) {
          clearManualRange(state, facetId);
        }
      })
);

const clearManualRange = (
  state: ManualNumericFacetSetState,
  facetId: string
) => {
  if (state[facetId]) {
    state[facetId] = {manualRange: undefined};
  }
};

const restoreParameters = (
  state: ManualNumericFacetSetState,
  payload?: Record<string, NumericRangeRequest[]>
) => {
  for (const facetId of Object.keys(state)) {
    delete state[facetId];
  }
  if (payload) {
    Object.entries(payload).forEach(([facetId, manualRange]) => {
      const range = manualRange[0];
      state[facetId] = {manualRange: range};
    });
  }
};
