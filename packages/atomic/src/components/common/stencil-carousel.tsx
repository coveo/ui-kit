import {h, FunctionalComponent, Fragment} from '@stencil/core';
import {JSXBase} from '@stencil/core/internal';
import ArrowRight from '../../images/arrow-right.svg';
import {AnyBindings} from './interface/bindings.js';
import {Button} from './stencil-button.js';

interface CarouselProps {
  bindings: AnyBindings;
  previousPage(): void;
  nextPage(): void;
  numberOfPages: number;
  currentPage: number;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const Carousel: FunctionalComponent<
  CarouselProps & JSXBase.HTMLAttributes<HTMLHeadingElement>
> = (props, children) => {
  const commonPaginationClasses =
    'w-10 h-10 grid justify-center items-center absolute top-1/2 -translate-y-1/2 z-1 shadow-lg group';
  const commonArrowClasses =
    'w-3.5 align-middle text-on-background group-hover:text-primary group-focus:text-primary-light';

  function renderPreviousButton() {
    return (
      <Button
        style="outline-primary"
        ariaLabel={props.bindings.i18n.t('previous')}
        onClick={() => props.previousPage()}
        part="previous-button"
        class={`${commonPaginationClasses} -translate-x-1/2`}
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
        style="outline-primary"
        ariaLabel={props.bindings.i18n.t('next')}
        onClick={() => props.nextPage()}
        part="next-button"
        class={`${commonPaginationClasses} right-0 translate-x-1/2`}
      >
        <atomic-icon icon={ArrowRight} class={commonArrowClasses}></atomic-icon>
      </Button>
    );
  }

  function renderIndicators() {
    return (
      <ul part="indicators" class="mt-6 flex justify-center gap-2">
        {Array.from({length: props.numberOfPages}, (_, index) => {
          const isActive = index === props.currentPage % props.numberOfPages;
          return (
            <li
              part={`indicator ${isActive ? 'active-indicator' : ''}`}
              class={`h-1 w-12 rounded-md ${
                isActive ? 'bg-primary' : 'bg-neutral'
              } `}
            ></li>
          );
        })}
      </ul>
    );
  }

  return (
    <Fragment>
      <div class="relative">
        {renderPreviousButton()}
        {children}
        {renderNextButton()}
      </div>
      {renderIndicators()}
    </Fragment>
  );
};
