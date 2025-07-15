import {html, nothing} from 'lit';
import {map} from 'lit/directives/map.js';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import ArrowRight from '../../images/arrow-right.svg';
import './atomic-icon/atomic-icon';
import {type ButtonProps, renderButton} from './button';
import type {AnyBindings} from './interface/bindings';

export interface CarouselProps {
  bindings: AnyBindings;
  previousPage(): void;
  nextPage(): void;
  numberOfPages: number;
  currentPage: number;
  ariaLabel: string;
}

const commonPaginationClasses =
  'w-10 h-10 grid justify-center items-center absolute top-1/2 -translate-y-1/2 z-1 shadow-lg group';
const commonArrowClasses =
  'w-3.5 align-middle text-on-background group-hover:text-primary group-focus:text-primary-light';

const renderPreviousButton = (
  numberOfPages: number,
  previousPage: () => void,
  bindings: AnyBindings
) => {
  if (numberOfPages <= 1) {
    return nothing;
  }
  const buttonProps: ButtonProps = {
    style: 'outline-primary',
    part: 'previous-button',
    class: `${commonPaginationClasses} -translate-x-1/2`,
    onClick: previousPage,
    ariaLabel: bindings.i18n.t('previous'),
  };
  return renderButton({
    props: buttonProps,
  })(
    html`<atomic-icon
      part="previous-icon"
      class=${`${commonArrowClasses} rotate-180`}
      icon=${ArrowRight}
    ></atomic-icon>`
  );
};

const renderNextButton = (
  numberOfPages: number,
  nextPage: () => void,
  bindings: AnyBindings
) => {
  if (numberOfPages <= 1) {
    return nothing;
  }
  const buttonProps: ButtonProps = {
    style: 'outline-primary',
    part: 'next-button',
    class: `${commonPaginationClasses} right-0 translate-x-1/2`,
    onClick: nextPage,
    ariaLabel: bindings.i18n.t('next'),
  };
  return renderButton({
    props: buttonProps,
  })(
    html`<atomic-icon
      part="next-icon"
      class=${commonArrowClasses}
      icon=${ArrowRight}
    ></atomic-icon>`
  );
};

const renderIndicators = (numberOfPages: number, currentPage: number) => {
  if (numberOfPages <= 1) {
    return nothing;
  }
  return html`
    <ul part="indicators" class="mt-6 flex justify-center gap-2">
      ${map(Array.from({length: numberOfPages}), (_, index) => {
        const isActive = index === currentPage % numberOfPages;
        return html`
          <li
            part=${`indicator${isActive ? ' active-indicator' : ''}`}
            class=${`h-1 w-12 rounded-md ${
              isActive ? 'bg-primary' : 'bg-neutral'
            } `}
          ></li>
        `;
      })}
    </ul>
  `;
};

export const renderCarousel: FunctionalComponentWithChildren<CarouselProps> =
  ({props}) =>
  (children) => {
    if (!children || children === nothing) {
      return html``;
    }

    const {previousPage, nextPage, numberOfPages, currentPage} = props;

    return html`
      <div
        class="relative"
        part="carousel"
        role="region"
        aria-roledescription="carousel"
        aria-label=${props.ariaLabel}
      >
        <div class="carousel-inner relative">
          <div class="carousel-controls">
            ${renderPreviousButton(numberOfPages, previousPage, props.bindings)}
            ${renderNextButton(numberOfPages, nextPage, props.bindings)}
          </div>
          <div class="carousel-items">${children}</div>
        </div>
        ${renderIndicators(numberOfPages, currentPage)}
      </div>
    `;
  };
