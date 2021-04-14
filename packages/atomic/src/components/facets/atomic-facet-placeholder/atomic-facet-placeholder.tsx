import {FunctionalComponent, h, Host} from '@stencil/core';

export interface FacetPlaceholderProps {
  numberOfValues: number;
}

export const FacetPlaceholder: FunctionalComponent<FacetPlaceholderProps> = ({
  numberOfValues,
}) => {
  const facetValues = [];
  for (let i = 0; i < numberOfValues; i++) {
    facetValues.push(
      <div class="flex mt-4">
        <div class="h-5 w-6 bg-divider mr-5"></div>
        <div class="h-3 mt-1 bg-divider w-full"></div>
      </div>
    );
  }

  return (
    <Host aria-hidden>
      <div class="p-7 animate-pulse border border-divider rounded-xl mb-4">
        <div class="h-3 mb-2 bg-divider w-5/6"></div>
        {facetValues}
      </div>
    </Host>
  );
};
