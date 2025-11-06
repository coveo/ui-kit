import {isNullOrUndefined} from '@coveo/bueno';
import {createSelector} from '@reduxjs/toolkit';
import type {SearchCommerceSuccessResponse} from '../../../api/commerce/search/response.js';
import type {
  CommerceEngine,
  CommerceEngineState,
} from '../../../app/commerce-engine/commerce-engine.js';
import {stateKey} from '../../../app/state-key.js';
import type {
  CommercePaginationSection,
  CommerceQuerySection,
  CommerceSearchSection,
} from '../../../state/state-sections.js';
import {getQ} from '../../parameter-manager/parameter-manager-selectors.js';
import {totalEntriesPrincipalSelector} from '../pagination/pagination-selectors.js';
import {activeParametersSelector as coreActiveParametersSelector} from '../parameters/parameters-selectors.js';
import {getCommerceQueryInitialState} from '../query/query-state.js';
import type {CommerceSearchParameters} from '../search-parameters/search-parameters-actions.js';

/**
 * Duplicate selector since the state is no longer accessible externally
 * TODO: KIT-3199: Update all other selectors to use the engine as a parameter
 */
export const responseIdSelectorFromEngine = (engine: CommerceEngine) =>
  engine[stateKey].commerceSearch.responseId;

export const responseIdSelector = (state: CommerceEngineState) =>
  state.commerceSearch.responseId;

export const requestIdSelector = (state: CommerceEngineState) =>
  state.commerceSearch.requestId;

export const numberOfProductsSelector = (
  state: Partial<CommerceSearchSection>
) => state.commerceSearch?.products.length || 0;

export const moreProductsAvailableSelector = createSelector(
  (state: Partial<CommercePaginationSection & CommerceSearchSection>) => ({
    total: totalEntriesPrincipalSelector(state),
    current: numberOfProductsSelector(state),
  }),
  ({current, total}) => current < total
);

export const isLoadingSelector = (state: Partial<CommerceSearchSection>) => {
  const isLoading = state.commerceSearch?.isLoading;
  return isNullOrUndefined(isLoading) ? false : isLoading;
};

export const errorSelector = (state: Partial<CommerceSearchSection>) =>
  state.commerceSearch?.error ?? null;

export const querySelector = (state: CommerceQuerySection) =>
  state.commerceQuery?.query ?? '';

const queryExecutedSelector = (state: CommerceSearchSection) =>
  state.commerceSearch?.queryExecuted;

export const queryExecutedFromResponseSelector = (
  state: CommerceQuerySection,
  response: SearchCommerceSuccessResponse
) => {
  if (!isNullOrUndefined(response.queryCorrection?.correctedQuery)) {
    return response.queryCorrection.correctedQuery;
  }

  return querySelector(state);
};

export const activeParametersSelector = (
  state: CommerceEngine[typeof stateKey]
): CommerceSearchParameters => {
  return {
    ...getQ(
      state?.commerceQuery,
      (s) => s.query,
      getCommerceQueryInitialState().query
    ),
    ...coreActiveParametersSelector(state),
  };
};

export function enrichedSummarySelector(state: CommerceEngineState) {
  return {
    query: queryExecutedSelector(state) || '',
  };
}
