import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import {
  renderCategoryFacetValueLink,
  type CategoryFacetValueLinkProps,
} from './value-link';

interface CategoryFacetChildValueLinkProps
  extends Omit<CategoryFacetValueLinkProps, 'isParent'> {}

export const renderCategoryFacetChildValueLink: FunctionalComponentWithChildren<
  CategoryFacetChildValueLinkProps
> = ({props}) => {
  return renderCategoryFacetValueLink({
    props: {...props, isParent: false},
  });
};

export type {CategoryFacetChildValueLinkProps};
