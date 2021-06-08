import {FunctionalComponent, h} from '@stencil/core';

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
        <div class="h-5 w-6 bg-neutral-light mr-5"></div>
        <div class="h-3 mt-1 bg-neutral-light w-full"></div>
      </div>
    );
  }

  return (
    <div
      part="placeholder"
      class="bg-background p-4 animate-pulse border border-neutral-light rounded-lg mb-4 w-32 lg:p-7 lg:w-auto"
      aria-hidden="true"
    >
      <div class="h-3 bg-neutral-light w-5/6"></div>
      <div class="mt-2 hidden lg:block">{facetValues}</div>
    </div>
  );
};
