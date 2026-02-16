import {FunctionalComponent, h} from '@stencil/core';

interface CategoryFacetChildrenAsTreeContainerProps {
  className?: string;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const CategoryFacetChildrenAsTreeContainer: FunctionalComponent<
  CategoryFacetChildrenAsTreeContainerProps
> = ({className}, children) => {
  return (
    <ul part="values" class={className ?? ''}>
      {children}
    </ul>
  );
};
