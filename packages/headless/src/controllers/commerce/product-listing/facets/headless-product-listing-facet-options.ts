import {defaultSolutionTypeId} from '../../../../features/commerce/common/actions';
import {isFacetResponse} from '../../../../features/commerce/facets/facet-set/facet-set-selector';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {
  CommerceFacetSetSection,
  ProductListingV2Section,
} from '../../../../state/state-sections';
import {CoreCommerceFacetOptions} from '../../core/facets/headless-core-commerce-facet';

export const facetResponseSelector = (
  state: ProductListingV2Section & CommerceFacetSetSection,
  facetId: string
) => {
  const response = state.productListing.facets.find(
    (response) => response.facetId === facetId
  );
  if (isFacetResponse(state, response)) {
    return response;
  }

  return undefined;
};

const isFacetLoadingResponseSelector = (state: ProductListingV2Section) =>
  state.productListing.isLoading;

export const commonOptions: Pick<
  CoreCommerceFacetOptions,
  | 'fetchResultsActionCreator'
  | 'facetResponseSelector'
  | 'isFacetLoadingResponseSelector'
> = {
  fetchResultsActionCreator: () =>
    fetchProductListing({solutionTypeId: defaultSolutionTypeId}),
  facetResponseSelector,
  isFacetLoadingResponseSelector,
};
