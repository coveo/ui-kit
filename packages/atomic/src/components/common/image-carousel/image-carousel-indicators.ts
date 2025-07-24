import {html} from 'lit';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

interface CarouselIndicatorProps {
  numberOfImages: number;
  currentImage: number;
  navigateToImage: (index: number) => void;
  maxImagesBeforeAndAfter?: number;
}

export const renderCarouselIndicator: FunctionalComponent<
  CarouselIndicatorProps
> = ({
  props: {
    numberOfImages,
    currentImage,
    navigateToImage,
    maxImagesBeforeAndAfter = 2,
  },
}) => {
  return html`
    <ul
      part="indicators"
      class="absolute bottom-2 mt-6 mb-1 flex max-w-4/5 items-center justify-center gap-2"
    >
      ${Array.from({length: numberOfImages}, (_, index) => {
        const isActive = index === currentImage % numberOfImages;

        const shouldDisplay =
          index >= Math.max(0, currentImage - maxImagesBeforeAndAfter) &&
          index <=
            Math.min(
              currentImage + maxImagesBeforeAndAfter,
              numberOfImages - 1
            );

        const isLastDisplayed =
          index === currentImage + maxImagesBeforeAndAfter &&
          index < numberOfImages - 1;

        const isFirstDisplayed =
          index === currentImage - maxImagesBeforeAndAfter && index > 0;

        return html`
          <li
            part=${`indicator${isActive ? ' active-indicator' : ''}`}
            class=${`hover:bg-primary-light cursor-pointer rounded-md shadow transition-all duration-200 ease-in-out ${
              isActive ? 'bg-primary' : 'bg-neutral'
            } ${isLastDisplayed || isFirstDisplayed ? 'mobile-only:w-2 mobile-only:h-2 h-1 w-1 scale-75 transform' : 'mobile-only:w-3 mobile-only:h-3 h-2 w-2 scale-100 transform'} ${
              shouldDisplay
                ? 'pointer-events-auto opacity-80'
                : 'pointer-events-none hidden opacity-0'
            }`}
            @click=${(event: Event) => {
              event.stopPropagation();
              navigateToImage(index);
            }}
          ></li>
        `;
      })}
    </ul>
  `;
};
