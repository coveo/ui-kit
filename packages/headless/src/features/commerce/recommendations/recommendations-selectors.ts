import {isNullOrUndefined} from '@coveo/bueno';
import {createSelector} from '@reduxjs/toolkit';
import type {
  CommercePaginationSection,
  RecommendationsSection,
} from '../../../state/state-sections.js';
import {totalEntriesRecommendationSelector} from '../pagination/pagination-selectors.js';

export const numberOfRecommendationsSelector = (
  state: Partial<RecommendationsSection>,
  slotId: string
) =>
  state.recommendations
    ? state.recommendations[slotId]?.products.length || 0
    : 0;

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

export const isLoadingSelector = (
  state: Partial<RecommendationsSection>,
  slotId: string
) => {
  const isLoading = state.recommendations
    ? state.recommendations[slotId]?.isLoading
    : false;
  return isNullOrUndefined(isLoading) ? false : isLoading;
};
