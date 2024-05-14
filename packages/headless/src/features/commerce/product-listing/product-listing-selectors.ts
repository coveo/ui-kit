import {isNullOrUndefined} from '@coveo/bueno';
import {createSelector} from '@reduxjs/toolkit';
import {CommerceEngineState} from '../../../app/commerce-engine/commerce-engine';
import {
  CommercePaginationSection,
  ProductListingV2Section,
} from '../../../state/state-sections';
import {totalEntriesPrincipalSelector} from '../pagination/pagination-selectors';

export const responseIdSelector = createSelector(
  (state: CommerceEngineState) => state.productListing.responseId,
  (responseId) => responseId
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
  (error) => error
);

export const firstSearchExecutedSelector = (state: CommerceEngineState) =>
  responseIdSelector(state) !== '';
