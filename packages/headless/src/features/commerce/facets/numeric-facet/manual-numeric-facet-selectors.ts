import {createSelector} from '@reduxjs/toolkit';
import {ManualRangeSection} from '../../../../state/state-sections.js';

export const manualNumericFacetSelector = createSelector(
  (state: ManualRangeSection, facetId: string) =>
    state.manualNumericFacetSet[facetId]?.manualRange,
  (manualRange) => manualRange
);
