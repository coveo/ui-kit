import type {i18n} from 'i18next';
import {html} from 'lit';
import {multiClassMap, tw} from '@/src/directives/multi-class-map';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import CloseIcon from '../../../images/close.svg';
import type {Breadcrumb} from './breadcrumb-types';
import {getFirstBreadcrumbValue} from './breadcrumb-utils';

export interface BreadcrumbContentProps {
  pathLimit: number;
  isCollapsed: boolean;
  i18n: i18n;
  breadcrumb: Breadcrumb;
}

/*
 * breadcrumb.content is currently of type VNode from stencil.
 * When migrating atomic-breadbox, we will first have to change what atomic-rating-facet sends as 'content' to an HtmlElement.
 * (By doing something similar to recent-queries.ts)
 */
export const renderBreadcrumbContent: FunctionalComponent<
  BreadcrumbContentProps
> = ({props}) => {
  const value = getFirstBreadcrumbValue(props.breadcrumb, props.pathLimit);

  const isExclusion = props.breadcrumb.state === 'excluded';
  const isSelected = props.breadcrumb.state === 'selected';
  const isIdle = props.breadcrumb.state === 'idle';

  const labelClass = tw({
    'max-w-[30ch] truncate': true,
    'group-hover:text-error group-focus-visible:text-error': isExclusion,
    'group-hover:text-primary group-focus-visible:text-primary': !isExclusion,
    idle: isIdle,
    selected: isSelected,
    excluded: isExclusion,
  });

  const valueClass = tw({
    'ml-1': true,
    'max-w-[30ch] truncate': !props.breadcrumb.content,
    idle: isIdle && !props.breadcrumb.content,
    selected: isSelected && !props.breadcrumb.content,
    excluded: isExclusion && !props.breadcrumb.content,
  });

  return html`<span part="breadcrumb-label" class=${multiClassMap(labelClass)}>
      ${props.i18n.t('with-colon', {
        text: props.breadcrumb.label,
        interpolation: {escapeValue: false},
      })}
    </span>
    <span part="breadcrumb-value" class=${multiClassMap(valueClass)}>
      ${props.breadcrumb.content ?? value}
    </span>
    <atomic-icon
      part="breadcrumb-clear"
      class="mt-px ml-2 h-2.5 w-2.5"
      icon=${CloseIcon}
    >
    </atomic-icon>`;
};
