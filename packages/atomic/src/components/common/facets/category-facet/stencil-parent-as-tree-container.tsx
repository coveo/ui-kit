import {FunctionalComponent, h} from '@stencil/core';

export interface CategoryFacetParentAsTreeContainerProps {
  isTopLevel: boolean;
  className?: string;
}
export const CategoryFacetParentAsTreeContainer: FunctionalComponent<
  CategoryFacetParentAsTreeContainerProps
> = ({isTopLevel, className}, children) => {
  return (
    <ul class={className ?? ''} part={`${isTopLevel ? '' : 'sub-'}parents`}>
      {children}
    </ul>
  );
};
