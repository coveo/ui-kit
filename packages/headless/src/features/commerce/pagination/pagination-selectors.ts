import {createSelector} from '@reduxjs/toolkit';
import {CommercePaginationSection} from '../../../state/state-sections';

export const perPagePrincipalSelector = createSelector(
  (state: Partial<CommercePaginationSection>) =>
    state.commercePagination?.principal.perPage || 0,
  (perPage) => perPage
);

export const perPageRecommendationSelector = createSelector(
  (state: Partial<CommercePaginationSection>, slotId: string) =>
    state.commercePagination?.recommendations[slotId]?.perPage || 0,
  (perPage) => perPage
);

export const totalEntriesPrincipalSelector = createSelector(
  (state: Partial<CommercePaginationSection>) =>
    state.commercePagination?.principal.totalEntries || 0,
  (totalEntries) => totalEntries
);

export const totalEntriesRecommendationSelector = createSelector(
  (state: Partial<CommercePaginationSection>, slotId: string) =>
    state.commercePagination?.recommendations[slotId]?.totalEntries || 0,
  (totalEntries) => totalEntries
);
