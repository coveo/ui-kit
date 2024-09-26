import {createSelector} from '@reduxjs/toolkit';
import {CommerceFacetSetSection} from '../../../../state/state-sections.js';
import {AnyFacetRequest} from './interfaces/request.js';

export const facetRequestSelector = createSelector(
  (state: CommerceFacetSetSection, facetId: string) => ({
    facetRequestSelector: state.commerceFacetSet[facetId],
  }),
  ({facetRequestSelector}): AnyFacetRequest | undefined => {
    return facetRequestSelector?.request;
  }
);
