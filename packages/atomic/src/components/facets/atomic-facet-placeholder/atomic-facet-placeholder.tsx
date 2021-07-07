import {FunctionalComponent, h} from '@stencil/core';
import {getRandomArbitrary} from '../../../utils/utils';

export interface FacetPlaceholderProps {
  numberOfValues: number;
}

export const FacetPlaceholder: FunctionalComponent<FacetPlaceholderProps> = ({
  numberOfValues,
}) => {
  const facetValues = [];
  for (let i = 0; i < numberOfValues; i++) {
    const width = `${getRandomArbitrary(60, 100)}%`;
    const opacity = `${getRandomArbitrary(0.3, 1)}`;
    facetValues.push(
      <div class="flex bg-neutral h-5 mt-4" style={{width, opacity}}></div>
    );
  }

  return (
    <div
      part="placeholder"
      class="bg-background p-4 animate-pulse border border-neutral rounded-lg mb-4 w-32 lg:p-7 lg:w-auto"
      aria-hidden="true"
    >
      <div
        class="bg-neutral rounded h-8"
        style={{width: `${getRandomArbitrary(25, 75)}%`}}
      ></div>
      <div class="mt-7 hidden lg:block">{facetValues}</div>
    </div>
  );
};
