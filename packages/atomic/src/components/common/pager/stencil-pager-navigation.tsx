import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';

/**
 * @deprecated use the lit equivalent
 */
export interface PagerNavigationProps {
  i18n: i18n;
}

/**
 * @deprecated use the lit equivalent
 */
export const PagerNavigation: FunctionalComponent<PagerNavigationProps> = (
  props,
  children
) => {
  return (
    <nav aria-label={props.i18n.t('pagination')}>
      <div part="buttons" role="toolbar" class="flex flex-wrap gap-2">
        {...children}
      </div>
    </nav>
  );
};
