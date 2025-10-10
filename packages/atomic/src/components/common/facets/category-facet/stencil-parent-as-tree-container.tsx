import {FunctionalComponent, h} from '@stencil/core';

interface CategoryFacetParentAsTreeContainerProps {
  isTopLevel: boolean;
  className?: string;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const CategoryFacetParentAsTreeContainer: FunctionalComponent<
  CategoryFacetParentAsTreeContainerProps
> = ({isTopLevel, className}, children) => {
  return (
    <ul class={className ?? ''} part={`${isTopLevel ? '' : 'sub-'}parents`}>
      {children}
    </ul>
  );
};
