import {h, FunctionalComponent, Fragment} from '@stencil/core';
import {i18n} from 'i18next';
import CloseIcon from '../../../images/close.svg';
import {Breadcrumb} from './breadcrumb-types';
import {getFirstBreadcrumbValue} from './breadcrumb-utils';

export interface BreadcrumbContentProps {
  pathLimit: number;
  isCollapsed: boolean;
  i18n: i18n;
  breadcrumb: Breadcrumb;
}

export const BreadcrumbContent: FunctionalComponent<BreadcrumbContentProps> = (
  props
) => {
  const value = getFirstBreadcrumbValue(props.breadcrumb, props.pathLimit);
  const isExclusion = props.breadcrumb.state === 'excluded';
  const activeColor = isExclusion ? 'error' : 'primary';
  return (
    <Fragment>
      <span
        part="breadcrumb-label"
        class={`max-w-snippet truncate group-hover:text-${activeColor} group-focus-visible:text-${activeColor} ${props.breadcrumb.state}`}
      >
        {props.i18n.t('with-colon', {text: props.breadcrumb.label})}
      </span>
      <span
        part="breadcrumb-value"
        class={
          props.breadcrumb.content
            ? ''
            : `max-w-snippet truncate ${props.breadcrumb.state}`
        }
      >
        {props.breadcrumb.content ?? value}
      </span>
      <atomic-icon
        part="breadcrumb-clear"
        class="ml-2 mt-px h-2.5 w-2.5"
        icon={CloseIcon}
      ></atomic-icon>
    </Fragment>
  );
};
