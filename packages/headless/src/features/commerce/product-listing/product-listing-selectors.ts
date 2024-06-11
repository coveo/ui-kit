import {isNullOrUndefined} from '@coveo/bueno';
import {createSelector} from '@reduxjs/toolkit';
import {
  CommerceEngineState,
  CommerceEngine,
} from '../../../app/commerce-engine/commerce-engine';
import {stateKey} from '../../../app/state-key';
import {
  CommercePaginationSection,
  ProductListingV2Section,
} from '../../../state/state-sections';
import {totalEntriesPrincipalSelector} from '../pagination/pagination-selectors';

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
  (state: Partial<ProductListingV2Section>) =>
    state.productListing?.products.length || 0,
  (len) => len
);

export const moreProductsAvailableSelector = createSelector(
  (state: Partial<CommercePaginationSection & ProductListingV2Section>) => ({
    total: totalEntriesPrincipalSelector(state),
    current: numberOfProductsSelector(state),
  }),
  ({current, total}) => current < total
);

export const isLoadingSelector = createSelector(
  (state: Partial<ProductListingV2Section>) => state.productListing?.isLoading,
  (isLoading) => (isNullOrUndefined(isLoading) ? false : isLoading)
);

export const errorSelector = createSelector(
  (state: Partial<ProductListingV2Section>) => state.productListing?.error,
  (error) => error ?? null
);
