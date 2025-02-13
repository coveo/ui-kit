import {h, FunctionalComponent, Fragment} from '@stencil/core';
import {JSXBase} from '@stencil/core/internal';
import ArrowRight from '../../../images/arrow-right.svg';
import {AnyBindings} from '../interface/bindings';
import {Button} from '../stencil-button';
import CarouselIndicator from './image-carousel-indicators';

export interface CarouselProps {
  bindings: AnyBindings;
  previousImage(): void;
  nextImage(): void;
  navigateToImage(index: number): void;
  numberOfImages: number;
  currentImage: number;
}

export const ImageCarousel: FunctionalComponent<
  CarouselProps & JSXBase.HTMLAttributes<HTMLHeadingElement>
> = (props, children) => {
  const commonPaginationClasses =
    'w-6 h-6 grid mobile-only:w-10 mobile-only:h-10 justify-center items-center z-1 group rounded-full duration-200 opacity-50 hover:opacity-100 focus:opacity-100 transition-opacity hover:shadow bottom-0 mb-1 absolute';
  const commonArrowClasses =
    'w-4 align-middle text-on-background group-hover:text-primary';

  function renderPreviousButton() {
    return (
      <Button
        style="text-primary"
        ariaLabel={props.bindings.i18n.t('previous')}
        onClick={(event) => {
          event?.stopPropagation();
          props.previousImage();
        }}
        part="previous-button"
        class={`${commonPaginationClasses} left-0 ml-1`}
      >
        <atomic-icon
          icon={ArrowRight}
          class={`${commonArrowClasses} rotate-180`}
        ></atomic-icon>
      </Button>
    );
  }

  function renderNextButton() {
    return (
      <Button
        style="text-primary"
        ariaLabel={props.bindings.i18n.t('next')}
        onClick={(event) => {
          event?.stopPropagation();
          props.nextImage();
        }}
        part="next-button"
        class={`${commonPaginationClasses} right-0 mr-1`}
      >
        <atomic-icon icon={ArrowRight} class={commonArrowClasses}></atomic-icon>
      </Button>
    );
  }
  function renderIndicators() {
    return (
      <CarouselIndicator
        numberOfImages={props.numberOfImages}
        currentImage={props.currentImage}
        navigateToImage={props.navigateToImage}
      />
    );
  }
  return (
    <Fragment>
      <div class="relative flex w-full min-w-full items-center justify-center">
        {renderPreviousButton()}
        {children}
        {renderNextButton()}
        {renderIndicators()}
      </div>
    </Fragment>
  );
};
