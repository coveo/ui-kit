import {h, FunctionalComponent} from '@stencil/core';
import {i18n} from 'i18next';

export interface BreadcrumbContainerProps {
  isCollapsed: boolean;
  i18n: i18n;
}

export const BreadcrumbContainer: FunctionalComponent<
  BreadcrumbContainerProps
> = (props, children) => {
  return (
    <div part="container" class="text-on-background flex text-sm">
      <span part="label" class="py-2.5 pl-0 pr-2 font-bold">
        {props.i18n.t('with-colon', {
          text: props.i18n.t('filters'),
        })}
      </span>
      <div part="breadcrumb-list-container" class="relative grow">
        <ul
          part="breadcrumb-list"
          class={`flex gap-1 ${
            props.isCollapsed ? 'absolute w-full flex-nowrap' : 'flex-wrap'
          }`}
        >
          {children}
        </ul>
      </div>
    </div>
  );
};
