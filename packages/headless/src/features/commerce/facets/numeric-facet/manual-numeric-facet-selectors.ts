import type {ManualRangeSection} from '../../../../state/state-sections.js';

export const manualNumericFacetSelector = (
  state: ManualRangeSection,
  facetId: string
) => state.manualNumericFacetSet[facetId]?.manualRange;
