import {createSelector} from '@reduxjs/toolkit';
import {CommercePaginationSection} from '../../../state/state-sections.js';

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

export const pagePrincipalSelector = createSelector(
  (state: Partial<CommercePaginationSection>) =>
    state.commercePagination?.principal.page || 0,
  (page) => page
);

export const pageRecommendationSelector = createSelector(
  (state: Partial<CommercePaginationSection>, slotId: string) =>
    state.commercePagination?.recommendations[slotId]?.page || 0,
  (page) => page
);
