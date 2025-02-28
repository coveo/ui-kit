import {PaginatedCommerceAPIRequest} from '../../../api/commerce/common/request.js';
import {NavigatorContext} from '../../../app/navigatorContextProvider.js';
import {CommercePaginationSection} from '../../../state/state-sections.js';
import {
  buildBaseCommerceAPIRequest,
  StateNeededForBaseCommerceAPIRequest,
} from './base-commerce-api-request-builder.js';

export type StateNeededForPaginatedCommerceAPIRequest =
  StateNeededForBaseCommerceAPIRequest & Partial<CommercePaginationSection>;

export const buildPaginatedCommerceAPIRequest = (
  state: StateNeededForPaginatedCommerceAPIRequest,
  navigatorContext: NavigatorContext,
  slotId?: string
): PaginatedCommerceAPIRequest => {
  return {
    ...buildBaseCommerceAPIRequest(state, navigatorContext),
    ...effectivePagination(state, slotId),
  };
};

const effectivePagination = (
  state: StateNeededForPaginatedCommerceAPIRequest,
  slotId?: string
) => {
  const effectiveSlice = slotId
    ? state.commercePagination?.recommendations[slotId]
    : state.commercePagination?.principal;
  return (
    effectiveSlice && {
      page: effectiveSlice!.page,
      ...(effectiveSlice!.perPage && {
        perPage: effectiveSlice!.perPage,
      }),
    }
  );
};
