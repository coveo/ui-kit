import {isNullOrUndefined} from '@coveo/bueno';
import {createSelector} from '@reduxjs/toolkit';
import {SearchCommerceSuccessResponse} from '../../../api/commerce/search/response';
import {
  CommerceEngine,
  CommerceEngineState,
} from '../../../app/commerce-engine/commerce-engine';
import {stateKey} from '../../../app/state-key';
import {
  CommercePaginationSection,
  CommerceQuerySection,
  CommerceSearchSection,
} from '../../../state/state-sections';
import {totalEntriesPrincipalSelector} from '../pagination/pagination-selectors';

/**
 * Duplicate selector since the state is no longer accessible externally
 * TODO: KIT-3199: Update all other selectors to use the engine as a parameter
 */
export const responseIdSelectorFromEngine = createSelector(
  (engine: CommerceEngine) => engine[stateKey].commerceSearch.responseId,
  (responseId) => responseId
);

export const responseIdSelector = createSelector(
  (state: CommerceEngineState) => state.commerceSearch.responseId,
  (responseId) => responseId
);

export const requestIdSelector = createSelector(
  (state: CommerceEngineState) => state.commerceSearch.requestId,
  (requestId) => requestId
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
  (state: CommerceQuerySection) => state.commerceQuery?.query,
  (query) => query ?? ''
);

export const queryExecutedSelector = createSelector(
  (state: CommerceSearchSection) => state.commerceSearch?.queryExecuted,
  (query) => query
);

export const queryExecutedFromResponseSelector = (
  state: CommerceQuerySection,
  response: SearchCommerceSuccessResponse
) => {
  if (!isNullOrUndefined(response.queryCorrection?.correctedQuery)) {
    return response.queryCorrection.correctedQuery;
  }

  return querySelector(state);
};
