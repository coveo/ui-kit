import {
  CommerceCategoryFacetSection,
  ProductListingV2Section,
} from '../../../../state/state-sections';
import {CategoryFacetResponse} from '../../../facets/category-facet-set/interfaces/response';
import {AnyFacetResponse} from '../../../facets/generic/interfaces/generic-facet-response';

export const commerceCategoryFacetRequestSelector = (
  state: CommerceCategoryFacetSection,
  id: string
) => {
  return state.commerceCategoryFacetSet[id]?.request;
};

export const commerceCategoryFacetResponseSelector = (
  state: CommerceCategoryFacetSection & ProductListingV2Section,
  facetId: string
) => {
  const response = baseCommerceFacetResponseSelector(state, facetId);
  if (isCommerceCategoryFacetResponse(state, response)) {
    return response;
  }

  return undefined;
};

export const baseCommerceFacetResponseSelector = (
  state: ProductListingV2Section,
  id: string
) => {
  return state.productListing.facets.find(
    (response) => response.facetId === id
  );
};

function isCommerceCategoryFacetResponse(
  state: CommerceCategoryFacetSection,
  response: AnyFacetResponse | undefined
): response is CategoryFacetResponse {
  return !!response && response.facetId in state.commerceCategoryFacetSet;
}

export const isCommerceCategoryFacetLoadingResponseSelector = (
  state: ProductListingV2Section
) => {
  return state.productListing.isLoading;
};
