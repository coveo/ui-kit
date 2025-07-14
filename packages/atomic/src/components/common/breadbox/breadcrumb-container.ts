import type {i18n} from 'i18next';
import {html} from 'lit';
import {multiClassMap, tw} from '@/src/directives/multi-class-map';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';

export interface BreadcrumbContainerProps {
  isCollapsed: boolean;
  i18n: i18n;
}

export const renderBreadcrumbContainer: FunctionalComponentWithChildren<
  BreadcrumbContainerProps
> =
  ({props}) =>
  (children) => {
    const listClass = tw({
      'flex gap-1': true,
      'absolute w-full flex-nowrap': props.isCollapsed,
      'flex-wrap': !props.isCollapsed,
    });

    return html`<div part="container" class="text-on-background flex text-sm">
      <span part="label" class="py-2.5 pr-2 pl-0 font-bold">
        ${props.i18n.t('with-colon', {
          text: props.i18n.t('filters'),
        })}
      </span>
      <div part="breadcrumb-list-container" class="relative grow">
        <ul part="breadcrumb-list" class=${multiClassMap(listClass)}>
          ${children}
        </ul>
      </div>
    </div>`;
  };
