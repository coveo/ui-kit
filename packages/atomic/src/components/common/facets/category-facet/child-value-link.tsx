import {FunctionalComponent, h} from '@stencil/core';
import {
  CategoryFacetValueLink,
  CategoryFacetValueLinkProps,
} from './value-link';

interface CategoryFacetParentValueLinkProps
  extends Omit<CategoryFacetValueLinkProps, 'isParent'> {}

export const CategoryFacetChildValueLink: FunctionalComponent<
  CategoryFacetParentValueLinkProps
> = (props, children) => {
  return (
    <CategoryFacetValueLink {...props} isParent={false}>
      {children}
    </CategoryFacetValueLink>
  );
};
