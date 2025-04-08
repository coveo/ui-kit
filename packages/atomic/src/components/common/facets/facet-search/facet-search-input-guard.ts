import {html, nothing} from 'lit';
import {directive, Directive} from 'lit/directive.js';

const MIN_VALUES_WHERE_FACET_SEARCH_IMPROVES_UX = 9;

interface FacetSearchInputGuardProps {
  withSearch: boolean;
  canShowMoreValues: boolean;
  numberOfDisplayedValues: number;
}

class FacetSearchInputGuardDirective extends Directive {
  render(
    {
      canShowMoreValues,
      numberOfDisplayedValues,
      withSearch,
    }: FacetSearchInputGuardProps,
    content: () => unknown
  ) {
    if (!withSearch) {
      return nothing;
    }

    if (
      !canShowMoreValues &&
      numberOfDisplayedValues < MIN_VALUES_WHERE_FACET_SEARCH_IMPROVES_UX
    ) {
      return nothing;
    }

    return html`${content()}`;
  }
}

export const facetSearchInputGuard = directive(FacetSearchInputGuardDirective);
