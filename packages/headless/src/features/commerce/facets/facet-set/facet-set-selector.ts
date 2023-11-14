import {CommerceFacetSetSection, ProductListingV2Section} from '../../../../state/state-sections';
import {AnyFacetResponse, FacetResponse} from '../../../../api/commerce/product-listings/v2/facet';


function isFacetResponse(
  state: CommerceFacetSetSection,
  response: AnyFacetResponse | undefined
): response is FacetResponse {
  return !!response && response.facetId in state.commerceFacetSet;
}

function baseCommerceFacetResponseSelector(
  state: ProductListingV2Section,
  field: string
) {
  const findByField = (response: { field: string }) => response.field === field;

  if ('productListing' in state) {
    return state.productListing.facets.find(findByField)
  }

  return undefined;
}

export const commerceFacetResponseSelector = (
  state: ProductListingV2Section & CommerceFacetSetSection,
  field: string
) => {
  const response = baseCommerceFacetResponseSelector(state, field);
  if (isFacetResponse(state, response)) {
    return response;
  }

  return undefined;
};

export const isCommerceFacetLoadingResponseSelector = (
  state: ProductListingV2Section
) => {
  if ('productListing' in state) {
    return state.productListing.isLoading;
  }

  return undefined;
};

export type CommerceFacetResponseSelector = typeof commerceFacetResponseSelector;
export type CommerceFacetIsLoadingSelector = typeof isCommerceFacetLoadingResponseSelector;
