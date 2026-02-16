import {FunctionalComponent, h} from '@stencil/core';

/**
 * @deprecated should only be used for Stencil components.
 */
export const CategoryFacetTreeValueContainer: FunctionalComponent = (
  _,
  children
) => {
  return <li class="contents">{children}</li>;
};
