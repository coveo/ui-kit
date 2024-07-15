import {createSelector} from '@reduxjs/toolkit';
import {ManualNumericFacetSetState} from './manual-numeric-facet-state';

export const selectManualRange = createSelector(
  (facetId: string, state?: ManualNumericFacetSetState) =>
    state && state[facetId]?.manualRange,
  (manualRange) => manualRange
);
