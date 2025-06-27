import {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import {i18n} from 'i18next';
import {html} from 'lit';

interface PagerNavigationProps {
  i18n: i18n;
}

export const renderPagerNavigation: FunctionalComponentWithChildren<
  PagerNavigationProps
> =
  ({props}) =>
  (children) => {
    return html`<nav aria-label=${props.i18n.t('pagination')}>
      <div part="buttons" role="toolbar" class="flex flex-wrap gap-2">
        ${children}
      </div>
    </nav>`;
  };
