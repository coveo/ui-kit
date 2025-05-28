import {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {i18n} from 'i18next';
import {html, nothing} from 'lit';
import {keyed} from 'lit/directives/keyed.js';
import {renderButton} from '../button';

export interface BreadcrumbClearAllProps {
  setRef: (el: HTMLButtonElement) => void;
  onClick: ((event?: MouseEvent | undefined) => void) | undefined;
  isCollapsed: boolean;
  i18n: i18n;
}

export const renderBreadcrumbClearAll: FunctionalComponent<
  BreadcrumbClearAllProps
> = ({props}) => {
  return html`${keyed(
    'clear-all',
    html` <li>
      ${renderButton({
        props: {
          ref: (el) => props.setRef(el as HTMLButtonElement),
          part: 'clear',
          style: 'text-primary',
          text: props.i18n.t('clear'),
          class: 'rounded-xl p-2',
          ariaLabel: props.i18n.t('clear-all-filters'),
          onClick: props.onClick,
        },
      })(nothing)}
    </li>`
  )}`;
};
