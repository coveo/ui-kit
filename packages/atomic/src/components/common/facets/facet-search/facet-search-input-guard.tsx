import {Fragment, FunctionalComponent, h} from '@stencil/core';

interface FacetSearchInputGuardProps {
  withSearch: boolean;
  canShowMoreValues: boolean;
  numberOfDisplayedValues: number;
}

export const FacetSearchInputGuard: FunctionalComponent<
  FacetSearchInputGuardProps
> = (
  {withSearch, canShowMoreValues, numberOfDisplayedValues: numberOfValues},
  children
) => {
  if (!withSearch) {
    return;
  }

  // Hide the input if there are no more values to load from the index and there are less than 8 values to display.
  // 8 is an arbitrary number, discussed with UX as a good compromise: A list long enough where it's worth searching.
  if (!canShowMoreValues && numberOfValues <= 8) {
    return;
  }

  return <Fragment>{children}</Fragment>;
};
