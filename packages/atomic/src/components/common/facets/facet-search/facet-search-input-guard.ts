import {html, nothing} from 'lit';
import {Directive, directive} from 'lit/directive.js';

const MIN_VALUES_WHERE_FACET_SEARCH_IMPROVES_UX = 9;

export interface FacetSearchInputGuardProps {
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

    // Hide the input if there are no more values to load from the index and there are less than 8 values to display.
    // 8 is an arbitrary number, discussed with UX as a good compromise: A list long enough where it's worth searching.
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
