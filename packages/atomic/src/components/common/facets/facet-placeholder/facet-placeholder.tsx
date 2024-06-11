import {FunctionalComponent, h} from '@stencil/core';

export interface FacetPlaceholderProps {
  numberOfValues: number;
  isCollapsed: boolean;
}

export const FacetPlaceholder: FunctionalComponent<FacetPlaceholderProps> = ({
  numberOfValues,
  isCollapsed,
}) => {
  const facetValues = [];
  for (let i = 0; i < numberOfValues; i++) {
    facetValues.push(
      <div
        class="flex bg-neutral h-5 mt-4"
        style={{width: '100%', opacity: '0.5'}}
      ></div>
    );
  }

  return (
    <div
      part="placeholder"
      class="bg-background animate-pulse border border-neutral rounded-lg mb-4 p-7"
      aria-hidden="true"
    >
      <div class="bg-neutral rounded h-8" style={{width: '75%'}}></div>
      {!isCollapsed && <div class="mt-7">{facetValues}</div>}
    </div>
  );
};
