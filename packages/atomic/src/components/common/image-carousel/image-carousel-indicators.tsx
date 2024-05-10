/* eslint-disable @cspell/spellchecker */
import {FunctionalComponent, h} from '@stencil/core';

interface CarouselIndicatorProps {
  numberOfImages: number;
  currentImage: number;
  navigateToImage: (index: number) => void;
  maxImagesBeforeAndAfter?: number;
}

const CarouselIndicator: FunctionalComponent<CarouselIndicatorProps> = ({
  numberOfImages,
  currentImage: currentImage,
  navigateToImage: navigateToImage,
  maxImagesBeforeAndAfter = 2,
}) => {
  return (
    <ul
      part="indicators"
      class="mb-1 absolute flex items-center justify-center gap-2 mt-6 bottom-2 max-w-[80%]"
    >
      {Array.from({length: numberOfImages}, (_, index) => {
        const isActive = index === currentImage % numberOfImages;

        const shouldDisplay =
          index >= Math.max(0, currentImage - maxImagesBeforeAndAfter) &&
          index <=
            Math.min(
              currentImage + maxImagesBeforeAndAfter,
              numberOfImages - 1
            );

        const isLastDisplayed =
          index ===
            Math.min(
              currentImage + maxImagesBeforeAndAfter,
              numberOfImages - 1
            ) && index < numberOfImages - 1;

        const isFirstDisplayed =
          index === Math.max(0, currentImage - maxImagesBeforeAndAfter) &&
          index > 0;

        return (
          <li
            part={`indicator ${isActive ? 'active-indicator' : ''}`}
            class={`rounded-md shadow cursor-pointer hover:bg-primary-light transition-all duration-200 ease-in-out ${
              isActive ? 'bg-primary' : 'bg-neutral'
            } ${isLastDisplayed || isFirstDisplayed ? 'w-1 h-1 transform scale-75' : 'h-2 w-2 transform scale-100'} ${
              shouldDisplay
                ? 'opacity-100 pointer-events-auto'
                : 'opacity-0 pointer-events-none hidden'
            }`}
            onClick={() => navigateToImage(index)}
          ></li>
        );
      })}
    </ul>
  );
};

export default CarouselIndicator;
