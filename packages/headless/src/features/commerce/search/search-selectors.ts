import {isNullOrUndefined} from '@coveo/bueno';
import {createSelector} from '@reduxjs/toolkit';
import {CommerceEngineState} from '../../../app/commerce-engine/commerce-engine';
import {
  CommercePaginationSection,
  CommerceSearchSection,
} from '../../../state/state-sections';
import {totalEntriesPrincipalSelector} from '../pagination/pagination-selectors';

export const responseIdSelector = createSelector(
  (state: CommerceEngineState) => state.commerceSearch.responseId,
  (responseId) => responseId
);

export const numberOfProductsSelector = createSelector(
  (state: Partial<CommerceSearchSection>) =>
    state.commerceSearch?.products.length || 0,
  (len) => len
);

export const moreProductsAvailableSelector = createSelector(
  (state: Partial<CommercePaginationSection & CommerceSearchSection>) => ({
    total: totalEntriesPrincipalSelector(state),
    current: numberOfProductsSelector(state),
  }),
  ({current, total}) => current < total
);

export const isLoadingSelector = createSelector(
  (state: Partial<CommerceSearchSection>) => state.commerceSearch?.isLoading,
  (isLoading) => (isNullOrUndefined(isLoading) ? false : isLoading)
);

export const errorSelector = createSelector(
  (state: Partial<CommerceSearchSection>) => state.commerceSearch?.error,
  (error) => error
);

export const querySelector = createSelector(
  (state: Partial<CommerceSearchSection>) =>
    state.commerceSearch?.queryExecuted,
  (query) => query
);
