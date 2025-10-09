import {FunctionalComponent, h} from '@stencil/core';

/**
 * @deprecated should only be used for Stencil components.
 */
export const CategoryFacetSearchResultsContainer: FunctionalComponent = (
  _,
  children
) => {
  return (
    <ul part="search-results" class="mt-3">
      {children}
    </ul>
  );
};
