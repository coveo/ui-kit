import {FunctionalComponent, h} from '@stencil/core';
import {
  CategoryFacetValueLink,
  CategoryFacetValueLinkProps,
} from './stencil-value-link';

interface CategoryFacetChildValueLinkProps
  extends Omit<CategoryFacetValueLinkProps, 'isParent'> {}

/**
 * @deprecated should only be used for Stencil components.
 */
export const CategoryFacetChildValueLink: FunctionalComponent<
  CategoryFacetChildValueLinkProps
> = (props, children) => {
  return (
    <CategoryFacetValueLink {...props} isParent={false}>
      {children}
    </CategoryFacetValueLink>
  );
};
