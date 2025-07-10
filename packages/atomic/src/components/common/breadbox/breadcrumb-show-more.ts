import type {i18n} from 'i18next';
import {html, nothing} from 'lit';
import {keyed} from 'lit/directives/keyed.js';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {renderButton} from '../button';

export interface BreadcrumbShowMoreProps {
  refCallback: (el: HTMLButtonElement) => void;
  onShowMore: () => void;
  numberOfCollapsedBreadcrumbs: number;
  isCollapsed: boolean;
  i18n: i18n;
  value: string;
  ariaLabel: string;
}

export const renderBreadcrumbShowMore: FunctionalComponent<
  BreadcrumbShowMoreProps
> = ({props}) => {
  if (!props.isCollapsed) {
    return nothing;
  }

  return html`${keyed(
    'show-more',
    html`
      <li>
        ${renderButton({
          props: {
            ref: (el) => props.refCallback(el as HTMLButtonElement),
            part: 'show-more',
            style: 'outline-primary',
            text: props.value,
            ariaLabel: props.ariaLabel,
            class: 'rounded-xl p-2',
            onClick: props.onShowMore,
          },
        })(nothing)}
      </li>
    `
  )}`;
};
