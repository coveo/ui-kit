import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import {
  renderCategoryFacetValueLink,
  type CategoryFacetValueLinkProps,
} from './value-link';

interface CategoryFacetParentValueLinkProps
  extends Omit<CategoryFacetValueLinkProps, 'isParent' | 'isSelected'> {}

export const renderCategoryFacetParentValueLink: FunctionalComponentWithChildren<
  CategoryFacetParentValueLinkProps
> = ({props}) => {
  return renderCategoryFacetValueLink({
    props: {...props, isParent: true, isSelected: true},
  });
};

export type {CategoryFacetParentValueLinkProps};
