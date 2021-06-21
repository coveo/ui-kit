import {FacetSearchState} from '@coveo/headless';

/**
 * Meant to be used inside the `componentShouldUpdate` lifecycle method.
 * It prevents updating the facet between two matchless facet searches.
 * It also prevents updating the facet until the first search has loaded.
 */
export function shouldUpdateFacetSearchComponent(
  nextFacetSearchState: FacetSearchState,
  prevFacetSearchState: FacetSearchState
) {
  const hasQuery = nextFacetSearchState.query !== '';
  const stillNoValues =
    !nextFacetSearchState.values.length && !prevFacetSearchState.values.length;
  const hasFinishedLoading =
    !nextFacetSearchState.isLoading && prevFacetSearchState.isLoading;

  if (hasQuery && stillNoValues) {
    return hasFinishedLoading;
  }

  return true;
}

export function shouldDisplaySearchResults(facetSearchState: FacetSearchState) {
  const hasQuery = facetSearchState.query !== '';
  const isLoading = facetSearchState.isLoading;
  const hasValues = !!facetSearchState.values.length;

  if (!hasQuery) {
    return false;
  }

  if (hasValues) {
    return true;
  }

  return !isLoading;
}
