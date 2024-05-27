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
import {getQ} from '../../parameter-manager/parameter-manager-selectors';
import {totalEntriesPrincipalSelector} from '../pagination/pagination-selectors';
import {
  activeParametersSelector as coreActiveParametersSelector,
  enrichedParametersSelector as coreEnrichedParametersSelector,
} from '../parameters/parameters-selectors';
import {getCommerceQueryInitialState} from '../query/query-state';
import {CommerceSearchParameters} from '../search-parameters/search-parameters-actions';

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

export function enrichedParametersSelector(
  state: CommerceEngine[typeof stateKey],
  activeParams: CommerceSearchParameters
) {
  return {
    q: getCommerceQueryInitialState().query!,
    ...coreEnrichedParametersSelector(state, activeParams),
  };
}
