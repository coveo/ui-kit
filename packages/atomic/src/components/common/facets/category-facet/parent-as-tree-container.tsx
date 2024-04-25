import {FunctionalComponent, h} from '@stencil/core';

export interface CategoryFacetParentAsTreeContainerProps {
  isRoot: boolean;
  className?: string;
}
export const CategoryFacetParentAsTreeContainer: FunctionalComponent<
  CategoryFacetParentAsTreeContainerProps
> = ({isRoot, className}, children) => {
  return (
    <ul
      class={className ? className : ''}
      part={`${isRoot ? '' : 'sub-'}parents`}
    >
      {children}
    </ul>
  );
};
