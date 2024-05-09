import {createSelector} from '@reduxjs/toolkit';
import {SearchCommerceSuccessResponse} from '../../../api/commerce/search/response';
import {CommerceEngineState} from '../../../app/commerce-engine/commerce-engine';
import {
  CommercePaginationSection,
  CommerceQuerySection,
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

export const querySelector = createSelector(
  (state: CommerceQuerySection) => state.commerceQuery?.query,
  (query) => query ?? ''
);

export const queryExecutedSelector = (
  state: CommerceQuerySection,
  response: SearchCommerceSuccessResponse
) => {
  if (response.queryCorrection?.correctedQuery !== undefined) {
    return response.queryCorrection?.correctedQuery;
  }

  return querySelector(state);
};
