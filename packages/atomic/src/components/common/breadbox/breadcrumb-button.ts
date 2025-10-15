import type {i18n} from 'i18next';
import {html} from 'lit';
import {keyed} from 'lit/directives/keyed.js';
import type {AriaLiveRegionController} from '@/src/utils/accessibility-utils';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import {renderButton} from '../button';
import type {Breadcrumb} from './breadcrumb-types';
import {
  getFirstBreadcrumbValue,
  joinBreadcrumbValues,
} from './breadcrumb-utils';

export interface BreadcrumbButtonProps {
  onSelectBreadcrumb: () => void;
  refCallback: (el?: HTMLButtonElement) => void;
  pathLimit: number;
  breadcrumb: Breadcrumb;
  i18n: i18n;
  ariaController: AriaLiveRegionController;
}

export const renderBreadcrumbButton: FunctionalComponentWithChildren<
  BreadcrumbButtonProps
> =
  ({props}) =>
  (children) => {
    const fullValue = joinBreadcrumbValues(props.breadcrumb);
    const value = getFirstBreadcrumbValue(props.breadcrumb, props.pathLimit);
    const title = `${props.breadcrumb.label}: ${fullValue}`;
    const isExclusion = props.breadcrumb.state === 'excluded';

    return html`
      ${keyed(
        value,
        html`<li class="breadcrumb">
          ${renderButton({
            props: {
              ref: (el) => props.refCallback(el as HTMLButtonElement),
              part: 'breadcrumb-button',
              style: isExclusion ? 'outline-error' : 'outline-bg-neutral',
              class: 'py-2 px-3 flex items-center rounded-xl group',
              title: title,
              ariaLabel: props.i18n.t(
                isExclusion
                  ? 'remove-exclusion-filter-on'
                  : 'remove-inclusion-filter-on',
                {
                  value: title,
                }
              ),
              onClick: () => {
                props.ariaController.message = props.i18n.t('filter-removed', {
                  value: title,
                });
                props.onSelectBreadcrumb();
              },
            },
          })(children)}
        </li>`
      )}
    `;
  };
