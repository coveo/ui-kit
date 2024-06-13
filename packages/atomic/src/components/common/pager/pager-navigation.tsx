import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';

export interface PagerNavigationProps {
  i18n: i18n;
}

export const PagerNavigation: FunctionalComponent<PagerNavigationProps> = (
  props,
  children
) => {
  return (
    <nav aria-label={props.i18n.t('pagination')}>
      <div part="buttons" class="flex flex-wrap gap-2">
        {...children}
      </div>
    </nav>
  );
};
