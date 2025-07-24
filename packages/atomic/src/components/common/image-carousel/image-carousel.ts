import {html, nothing} from 'lit';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import ArrowRight from '../../../images/arrow-right.svg';
import '../atomic-icon/atomic-icon';
import {renderButton} from '../button';
import type {AnyBindings} from '../interface/bindings';
import {renderCarouselIndicator} from './image-carousel-indicators';

export interface CarouselProps {
  bindings: AnyBindings;
  previousImage(): void;
  nextImage(): void;
  navigateToImage(index: number): void;
  numberOfImages: number;
  currentImage: number;
}

export const renderImageCarousel: FunctionalComponentWithChildren<
  CarouselProps
> = ({props}) => {
  const commonPaginationClasses =
    'w-6 h-6 grid mobile-only:w-10 mobile-only:h-10 justify-center items-center z-1 group rounded-full duration-200 opacity-50 hover:opacity-100 focus:opacity-100 transition-opacity hover:shadow-sm bottom-0 mb-1 absolute';
  const commonArrowClasses =
    'w-4 align-middle text-on-background group-hover:text-primary';

  const renderPreviousButton = () => {
    return renderButton({
      props: {
        style: 'text-primary',
        ariaLabel: props.bindings.i18n.t('previous'),
        onClick: (event?: MouseEvent) => {
          event?.stopPropagation();
          props.previousImage();
        },
        part: 'previous-button',
        class: `${commonPaginationClasses} left-0 ml-1`,
      },
    })(html`
      <atomic-icon
        part="previous-icon"
        icon=${ArrowRight}
        class=${`${commonArrowClasses} rotate-180`}
      ></atomic-icon>
    `);
  };

  const renderNextButton = () => {
    return renderButton({
      props: {
        style: 'text-primary',
        ariaLabel: props.bindings.i18n.t('next'),
        onClick: (event?: MouseEvent) => {
          event?.stopPropagation();
          props.nextImage();
        },
        part: 'next-button',
        class: `${commonPaginationClasses} right-0 mr-1`,
      },
    })(html`
      <atomic-icon part="next-icon" icon=${ArrowRight} class=${commonArrowClasses}></atomic-icon>
    `);
  };

  const renderIndicators = () => {
    return renderCarouselIndicator({
      props: {
        numberOfImages: props.numberOfImages,
        currentImage: props.currentImage,
        navigateToImage: props.navigateToImage,
      },
    });
  };

  return (children) => {
    if (!children || children === nothing) {
      return nothing;
    }
    return html` <div class="relative flex w-full min-w-full items-center justify-center">
        ${renderPreviousButton()}
        ${children}
        ${renderNextButton()}
        ${renderIndicators()}
      </div>`;
  };
};
