import escape from 'escape-html';
import {directive, Directive, Part} from 'lit/directive.js';
import {regexEncode} from '../../../../utils/string-utils';

interface FacetSearchState {
  query: string;
  values: unknown[];
  isLoading: boolean;
}

/**
 * Meant to be used inside the `shouldUpdate` lifecycle method.
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

class HighlightSearchResultDirective extends Directive {
  update(_part: Part, props: Array<unknown>): unknown {
    const [resultValue, searchQuery] = props as [string, string | undefined];
    console.log('--- update', resultValue, searchQuery);
    return this.render(resultValue, searchQuery);
  }
  render(resultValue: string, searchQuery = '') {
    console.log('--- render', resultValue, searchQuery);
    const sanitizedResult = escape(resultValue);

    if (searchQuery.trim() === '') {
      return sanitizedResult;
    }

    const regex = new RegExp(`(${regexEncode(escape(searchQuery))})`, 'i');
    return sanitizedResult.replace(
      regex,
      '<span part="search-highlight" class="font-bold">$1</span>'
    );
  }
}

export const highlightSearchResult = directive(HighlightSearchResultDirective);
