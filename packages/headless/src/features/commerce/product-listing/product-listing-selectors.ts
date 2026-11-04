import {isNullOrUndefined} from '@coveo/bueno';
import {createSelector} from '@reduxjs/toolkit';
import {ResultType} from '../../../api/commerce/common/result.js';
import type {
  CommerceEngine,
  CommerceEngineState,
} from '../../../app/commerce-engine/commerce-engine.js';
import {stateKey} from '../../../app/state-key.js';
import type {
  CommercePaginationSection,
  ProductListingSection,
} from '../../../state/state-sections.js';
import {totalEntriesPrincipalSelector} from '../pagination/pagination-selectors.js';

/**
 * Duplicate selector since the state is no longer accessible externally
 * TODO: KIT-3199: Update all other selectors to use the engine as a parameter
 */
export const responseIdSelectorFromEngine = (engine: CommerceEngine) =>
  engine[stateKey].productListing.responseId;

export const responseIdSelector = (state: CommerceEngineState) => state.productListing.responseId;

export const requestIdSelector = (state: CommerceEngineState) => state.productListing.requestId;

export const numberOfProductsSelector = (state: Partial<ProductListingSection>) =>
  state.productListing?.results.length || state.productListing?.products.length || 0;

export const numberOfProductsExcludingSpotlightsSelector = (
  state: Partial<ProductListingSection>
) => {
  const results = state.productListing?.results ?? [];
  if (results.length === 0) {
    return state.productListing?.products.length ?? 0;
  }
  return results.filter((result) => result.resultType !== ResultType.SPOTLIGHT).length;
};

export const moreProductsAvailableSelector = createSelector(
  (state: Partial<CommercePaginationSection & ProductListingSection>) => ({
    total: totalEntriesPrincipalSelector(state),
    current: numberOfProductsSelector(state),
  }),
  ({current, total}) => current < total
);

export const isLoadingSelector = (state: Partial<ProductListingSection>) => {
  const isLoading = state.productListing?.isLoading;
  return isNullOrUndefined(isLoading) ? false : isLoading;
};

export const errorSelector = (state: Partial<ProductListingSection>) =>
  state.productListing?.error ?? null;
