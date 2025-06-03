import {multiClassMap, tw} from '@/src/directives/multi-class-map';
import {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {i18n} from 'i18next';
import {html} from 'lit';
import CloseIcon from '../../../images/close.svg';
import {Breadcrumb} from './breadcrumb-types';
import {getFirstBreadcrumbValue} from './breadcrumb-utils';

export interface BreadcrumbContentProps {
  pathLimit: number;
  isCollapsed: boolean;
  i18n: i18n;
  breadcrumb: Breadcrumb;
}

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
    'ml-1 max-w-[30ch] truncate': true,
    idle: isIdle,
    selected: isSelected,
    excluded: isExclusion,
  });

  return html`<span part="breadcrumb-label" class=${multiClassMap(labelClass)}>
      ${props.i18n.t('with-colon', {text: props.breadcrumb.label})}
    </span>
    <span part="breadcrumb-value" class=${multiClassMap(valueClass)}>
      ${value}
    </span>
    <atomic-icon
      part="breadcrumb-clear"
      class="mt-px ml-2 h-2.5 w-2.5"
      icon=${CloseIcon}
    >
    </atomic-icon>`;
};
