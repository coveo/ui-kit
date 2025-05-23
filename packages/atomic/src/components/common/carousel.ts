import {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import {html, nothing} from 'lit';
import {map} from 'lit/directives/map.js';
import ArrowRight from '../../images/arrow-right.svg';
import './atomic-icon/atomic-icon';
import {ButtonProps, renderButton} from './button';
import {AnyBindings} from './interface/bindings';

export interface CarouselProps {
  bindings: AnyBindings;
  previousPage(): void;
  nextPage(): void;
  numberOfPages: number;
  currentPage: number;
  ariaLabel: string;
}

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
    class: 'group',
    onClick: previousPage,
    ariaLabel: bindings.i18n.t('previous'),
  };
  return renderButton({
    props: buttonProps,
  })(
    html`<atomic-icon
      part="previous-icon"
      icon=${ArrowRight}
      class="carousel-previous min-h-4 min-w-4"
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
    class: 'group',
    onClick: nextPage,
    ariaLabel: bindings.i18n.t('next'),
  };
  return renderButton({
    props: buttonProps,
  })(
    html`<atomic-icon
      part="next-icon"
      icon=${ArrowRight}
      class="carousel-next min-h-4 min-w-4"
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
            part=${`indicator ${isActive ? 'active-indicator' : ''}`}
            class=${`h-1 w-12 rounded-md ${
              isActive ? 'bg-primary' : 'bg-neutral'
            }`}
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
        class="carousel relative"
        role="region"
        aria-roledescription="carousel"
        aria-label=${props.ariaLabel}
      >
        ${renderPreviousButton(
          numberOfPages,
          previousPage,
          props.bindings
        )}${children}
        ${renderNextButton(numberOfPages, nextPage, props.bindings)}
      </div>
      ${renderIndicators(numberOfPages, currentPage)}
    `;
  };
