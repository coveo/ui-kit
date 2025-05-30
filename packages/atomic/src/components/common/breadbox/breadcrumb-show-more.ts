import {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {i18n} from 'i18next';
import {html, nothing} from 'lit';
import {keyed} from 'lit/directives/keyed.js';
import {renderButton} from '../button';

export interface BreadcrumbShowMoreProps {
  setRef: (el: HTMLButtonElement) => void;
  onShowMore: () => void;
  numberOfCollapsedBreadcrumbs: number;
  isCollapsed: boolean;
  i18n: i18n;
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
            ref: (el) => props.setRef(el as HTMLButtonElement),
            part: 'show-more',
            style: 'outline-primary',
            text: props.i18n.t('show-n-more-filters', {
              value: props.numberOfCollapsedBreadcrumbs,
            }),
            class: 'rounded-xl p-2',
            onClick: props.onShowMore,
          },
        })(nothing)}
      </li>
    `
  )}`;
};
