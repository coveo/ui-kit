import {createSelector} from '@reduxjs/toolkit';
import type {CommerceFacetSetSection} from '../../../../state/state-sections.js';
import type {AnyFacetRequest} from './interfaces/request.js';

export const facetRequestSelector = createSelector(
  (state: CommerceFacetSetSection, facetId: string) => ({
    facetRequestSelector: state.commerceFacetSet[facetId],
  }),
  ({facetRequestSelector}): AnyFacetRequest | undefined => {
    return facetRequestSelector?.request;
  }
);
