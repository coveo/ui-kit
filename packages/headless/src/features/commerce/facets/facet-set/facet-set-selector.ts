import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {stateKey} from '../../../../app/state-key';
import {
  CommerceFacetSetSection,
  CommerceSearchSection,
  ProductListingV2Section,
} from '../../../../state/state-sections';
import {AnyFacetResponse} from './interfaces/response';

// TODO: test
export type FacetResponseSection =
  | CommerceFacetSetSection
  | CommerceSearchSection
  | ProductListingV2Section;

export const baseFacetResponseSelector = (
  engine: CommerceEngine,
  id: string
): AnyFacetResponse | undefined => {
  const state = engine[stateKey];
  const findById = (response: {facetId: string}) => response.facetId === id;
  if (
    'productListing' in state &&
    state.productListing &&
    'facets' in state.productListing
  ) {
    return state.productListing.facets.find(findById);
  }

  if ('commerceSearch' in state && state.commerceSearch) {
    return state.commerceSearch.facets.find(findById);
  }

  return undefined;
};

export function isFacetResponse(
  state: CommerceFacetSetSection,
  response: AnyFacetResponse | undefined
): response is AnyFacetResponse {
  return !!response && response.facetId in state.commerceFacetSet;
}
