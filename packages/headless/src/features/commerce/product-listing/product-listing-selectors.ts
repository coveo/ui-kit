import {createSelector} from '@reduxjs/toolkit';
import type {
  CommerceEngine,
  CommerceEngineState,
} from '../../../app/commerce-engine/commerce-engine.js';
import {stateKey} from '../../../app/state-key.js';
import type {
  CommercePaginationSection,
  ProductListingSection,
} from '../../../state/state-sections.js';
import {isNullOrUndefined} from '../../../utils/bueno-zod.js';
import {totalEntriesPrincipalSelector} from '../pagination/pagination-selectors.js';

/**
 * Duplicate selector since the state is no longer accessible externally
 * TODO: KIT-3199: Update all other selectors to use the engine as a parameter
 */
export const responseIdSelectorFromEngine = createSelector(
  (engine: CommerceEngine) => engine[stateKey].productListing.responseId,
  (responseId) => responseId
);

export const responseIdSelector = createSelector(
  (state: CommerceEngineState) => state.productListing.responseId,
  (responseId) => responseId
);

export const requestIdSelector = createSelector(
  (state: CommerceEngineState) => state.productListing.requestId,
  (requestId) => requestId
);

export const numberOfProductsSelector = createSelector(
  (state: Partial<ProductListingSection>) =>
    state.productListing?.products.length || 0,
  (len) => len
);

export const moreProductsAvailableSelector = createSelector(
  (state: Partial<CommercePaginationSection & ProductListingSection>) => ({
    total: totalEntriesPrincipalSelector(state),
    current: numberOfProductsSelector(state),
  }),
  ({current, total}) => current < total
);

export const isLoadingSelector = createSelector(
  (state: Partial<ProductListingSection>) => state.productListing?.isLoading,
  (isLoading) => (isNullOrUndefined(isLoading) ? false : isLoading)
);

export const errorSelector = createSelector(
  (state: Partial<ProductListingSection>) => state.productListing?.error,
  (error) => error ?? null
);
