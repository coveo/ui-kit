import {isFacetResponse} from '../../../../features/commerce/facets/facet-set/facet-set-selector';
import {executeSearch} from '../../../../features/commerce/search/search-actions';
import {
  CommerceFacetSetSection,
  CommerceSearchSection,
} from '../../../../state/state-sections';
import {CoreCommerceFacetOptions} from '../../facets/core/headless-core-commerce-facet';

const facetResponseSelector = (
  state: CommerceSearchSection & CommerceFacetSetSection,
  facetId: string
) => {
  const response = state.commerceSearch.facets.find(
    (response) => response.facetId === facetId
  );
  if (isFacetResponse(state, response)) {
    return response;
  }

  return undefined;
};

const isFacetLoadingResponseSelector = (state: CommerceSearchSection) =>
  state.commerceSearch.isLoading;

export const commonOptions: Pick<
  CoreCommerceFacetOptions,
  | 'fetchResultsActionCreator'
  | 'facetResponseSelector'
  | 'isFacetLoadingResponseSelector'
> = {
  fetchResultsActionCreator: executeSearch,
  facetResponseSelector,
  isFacetLoadingResponseSelector,
};
