import {FunctionalComponent, h} from '@stencil/core';
import {
  CategoryFacetValueLink,
  CategoryFacetValueLinkProps,
} from './stencil-value-link';

interface CategoryFacetParentValueLinkProps
  extends Omit<CategoryFacetValueLinkProps, 'isParent' | 'isSelected'> {}

/**
 * @deprecated should only be used for Stencil components.
 */
export const CategoryFacetParentValueLink: FunctionalComponent<
  CategoryFacetParentValueLinkProps
> = (props, children) => {
  return (
    <CategoryFacetValueLink {...props} isParent isSelected>
      {children}
    </CategoryFacetValueLink>
  );
};
