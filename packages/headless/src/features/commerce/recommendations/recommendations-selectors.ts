import {isNullOrUndefined} from '@coveo/bueno';
import {createSelector} from '@reduxjs/toolkit';
import {
  CommercePaginationSection,
  RecommendationsSection,
} from '../../../state/state-sections.js';
import {totalEntriesRecommendationSelector} from '../pagination/pagination-selectors.js';

export const numberOfRecommendationsSelector = createSelector(
  (state: Partial<RecommendationsSection>, slotId: string) =>
    state.recommendations
      ? state.recommendations[slotId]?.products.length || 0
      : 0,
  (len) => len
);

export const moreRecommendationsAvailableSelector = createSelector(
  (
    state: Partial<CommercePaginationSection & RecommendationsSection>,
    slotId: string
  ) => ({
    total: totalEntriesRecommendationSelector(state, slotId),
    current: numberOfRecommendationsSelector(state, slotId),
  }),
  ({current, total}) => current < total
);

export const isLoadingSelector = createSelector(
  (state: Partial<RecommendationsSection>, slotId: string) =>
    state.recommendations ? state.recommendations[slotId]?.isLoading : false,
  (isLoading) => (isNullOrUndefined(isLoading) ? false : isLoading)
);
