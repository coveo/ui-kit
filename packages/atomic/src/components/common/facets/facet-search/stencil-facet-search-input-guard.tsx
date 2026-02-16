import {Fragment, FunctionalComponent, h} from '@stencil/core';

const MIN_VALUES_WHERE_FACET_SEARCH_IMPROVES_UX = 9;

interface FacetSearchInputGuardProps {
  withSearch: boolean;
  canShowMoreValues: boolean;
  numberOfDisplayedValues: number;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const FacetSearchInputGuard: FunctionalComponent<
  FacetSearchInputGuardProps
> = ({withSearch, canShowMoreValues, numberOfDisplayedValues}, children) => {
  if (!withSearch) {
    return;
  }

  // Hide the input if there are no more values to load from the index and there are less than 8 values to display.
  // 8 is an arbitrary number, discussed with UX as a good compromise: A list long enough where it's worth searching.
  if (
    !canShowMoreValues &&
    numberOfDisplayedValues < MIN_VALUES_WHERE_FACET_SEARCH_IMPROVES_UX
  ) {
    return;
  }

  return <Fragment>{children}</Fragment>;
};
