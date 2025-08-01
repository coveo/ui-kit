import type {i18n} from 'i18next';
import {html, nothing} from 'lit';
import {keyed} from 'lit/directives/keyed.js';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {renderButton} from '../button';

export interface BreadcrumbShowLessProps {
  onShowLess: () => void;
  isCollapsed: boolean;
  i18n: i18n;
}

export const renderBreadcrumbShowLess: FunctionalComponent<
  BreadcrumbShowLessProps
> = ({props}) => {
  if (props.isCollapsed) {
    return nothing;
  }

  return html`${keyed(
    'show-less',
    html`
      <li>
        ${renderButton({
          props: {
            part: 'show-less',
            style: 'outline-primary',
            text: props.i18n.t('show-less'),
            class: 'rounded-xl p-2',
            onClick: props.onShowLess,
          },
        })(nothing)}
      </li>
    `
  )}`;
};
