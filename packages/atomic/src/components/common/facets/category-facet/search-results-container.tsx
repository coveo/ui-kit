import {FunctionalComponent, h} from '@stencil/core';

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
