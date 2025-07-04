import {type FunctionalComponent, h} from '@stencil/core';
import {
  CategoryFacetValueLink,
  type CategoryFacetValueLinkProps,
} from './value-link';

interface CategoryFacetParentValueLinkProps
  extends Omit<CategoryFacetValueLinkProps, 'isParent' | 'isSelected'> {}

export const CategoryFacetParentValueLink: FunctionalComponent<
  CategoryFacetParentValueLinkProps
> = (props, children) => {
  return (
    <CategoryFacetValueLink {...props} isParent isSelected>
      {children}
    </CategoryFacetValueLink>
  );
};
