import {FunctionalComponent, h} from '@stencil/core';
import {
  CategoryFacetValueLink,
  CategoryFacetValueLinkProps,
} from './value-link';

interface CategoryFacetChildValueLinkProps
  extends Omit<CategoryFacetValueLinkProps, 'isParent'> {}

export const CategoryFacetChildValueLink: FunctionalComponent<
  CategoryFacetChildValueLinkProps
> = (props, children) => {
  return (
    <CategoryFacetValueLink {...props} isParent={false}>
      {children}
    </CategoryFacetValueLink>
  );
};
