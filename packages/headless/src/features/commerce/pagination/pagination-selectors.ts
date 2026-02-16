import type {CommercePaginationSection} from '../../../state/state-sections.js';

export const perPagePrincipalSelector = (
  state: Partial<CommercePaginationSection>
) => state.commercePagination?.principal.perPage || 0;

export const perPageRecommendationSelector = (
  state: Partial<CommercePaginationSection>,
  slotId: string
) => state.commercePagination?.recommendations[slotId]?.perPage || 0;

export const totalEntriesPrincipalSelector = (
  state: Partial<CommercePaginationSection>
) => state.commercePagination?.principal.totalEntries || 0;

export const totalEntriesRecommendationSelector = (
  state: Partial<CommercePaginationSection>,
  slotId: string
) => state.commercePagination?.recommendations[slotId]?.totalEntries || 0;

export const pagePrincipalSelector = (
  state: Partial<CommercePaginationSection>
) => state.commercePagination?.principal.page || 0;

export const pageRecommendationSelector = (
  state: Partial<CommercePaginationSection>,
  slotId: string
) => state.commercePagination?.recommendations[slotId]?.page || 0;
