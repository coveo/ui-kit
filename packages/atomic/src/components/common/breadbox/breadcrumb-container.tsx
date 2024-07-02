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
    <div part="container" class="flex text-sm text-on-background">
      <span part="label" class="font-bold py-[0.625rem] pl-0 pr-2">
        {props.i18n.t('with-colon', {
          text: props.i18n.t('filters'),
        })}
      </span>
      <div part="breadcrumb-list-container" class="relative grow">
        <ul
          part="breadcrumb-list"
          class={`flex gap-1 ${
            props.isCollapsed ? 'flex-nowrap absolute w-full' : 'flex-wrap'
          }`}
        >
          {children}
        </ul>
      </div>
    </div>
  );
};
