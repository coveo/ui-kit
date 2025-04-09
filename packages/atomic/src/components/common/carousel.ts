import {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import {html} from 'lit';
import ArrowRight from '../../images/arrow-right.svg';
import './atomic-icon/atomic-icon';
import {button, ButtonProps} from './button';
import {AnyBindings} from './interface/bindings';

export interface CarouselProps {
  bindings: AnyBindings;
  previousPage(): void;
  nextPage(): void;
  numberOfPages: number;
  currentPage: number;
}

export const carousel: FunctionalComponentWithChildren<CarouselProps> =
  ({props}) =>
  (children) => {
    const {previousPage, nextPage, numberOfPages, currentPage} = props;

    const renderPreviousButton = () => {
      const buttonProps: ButtonProps = {
        style: 'outline-primary',
        part: 'previous-button',
        class: 'group',
        onClick: previousPage,
        ariaLabel: props.bindings.i18n.t('previous'),
      };
      return button({
        props: buttonProps,
      })(
        html`<atomic-icon
          icon="${ArrowRight}"
          class="carousel-previous"
        ></atomic-icon>`
      );
    };

    const renderNextButton = () => {
      const buttonProps: ButtonProps = {
        style: 'outline-primary',
        part: 'next-button',
        class: 'group',
        onClick: nextPage,
        ariaLabel: props.bindings.i18n.t('next'),
      };
      return button({
        props: buttonProps,
      })(
        html`<atomic-icon
          icon="${ArrowRight}"
          class="carousel-next"
        ></atomic-icon>`
      );
    };

    const renderIndicators = () => html`
      <ul part="indicators" class="mt-6 flex justify-center gap-2">
        ${Array.from({length: numberOfPages}, (_, index) => {
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

    return html`
      <div class="carousel relative">
        ${renderPreviousButton()} ${children} ${renderNextButton()}
      </div>
      ${renderIndicators()}
    `;
  };
