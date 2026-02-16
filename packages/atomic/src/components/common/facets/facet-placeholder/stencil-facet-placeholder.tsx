import {FunctionalComponent, h} from '@stencil/core';

interface FacetPlaceholderProps {
  numberOfValues: number;
  isCollapsed: boolean;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const FacetPlaceholder: FunctionalComponent<FacetPlaceholderProps> = ({
  numberOfValues,
  isCollapsed,
}) => {
  const facetValues = [];
  for (let i = 0; i < numberOfValues; i++) {
    facetValues.push(
      <div
        class="bg-neutral mt-4 flex h-5"
        style={{width: '100%', opacity: '0.5'}}
      ></div>
    );
  }

  return (
    <div
      part="placeholder"
      class="bg-background border-neutral mb-4 animate-pulse rounded-lg border p-7"
      aria-hidden="true"
    >
      <div class="bg-neutral h-8 rounded" style={{width: '75%'}}></div>
      {!isCollapsed && <div class="mt-7">{facetValues}</div>}
    </div>
  );
};
