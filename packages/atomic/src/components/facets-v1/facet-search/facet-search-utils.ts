import {FacetSearchState} from '@coveo/headless';
import escape from 'escape-html';
import {regexEncode} from '../../../utils/string-utils';

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

export function highlightSearchResult(resultValue: string, searchQuery = '') {
  const sanitizedResult = escape(resultValue);

  if (searchQuery.trim() === '') {
    return sanitizedResult;
  }

  const regex = new RegExp(`(${regexEncode(searchQuery)})`, 'i');
  return escape(resultValue).replace(
    regex,
    '<span part="search-highlight" class="font-bold">$1</span>'
  );
}
