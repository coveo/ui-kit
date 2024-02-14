import {FunctionalComponent, h} from '@stencil/core';

export interface PagerNavigationProps {
  label: string;
}

export const PagerNavigation: FunctionalComponent<PagerNavigationProps> = (
  props,
  children
) => {
  return (
    <nav aria-label={props.label}>
      <div part="buttons" class="flex gap-2 flex-wrap">
        {...children}
      </div>
    </nav>
  );
};
