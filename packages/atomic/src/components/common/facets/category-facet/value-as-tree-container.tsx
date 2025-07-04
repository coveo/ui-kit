import {type FunctionalComponent, h} from '@stencil/core';

export const CategoryFacetTreeValueContainer: FunctionalComponent = (
  _,
  children
) => {
  return <li class="contents">{children}</li>;
};
