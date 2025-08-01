import type {i18n} from 'i18next';
import {html} from 'lit';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

interface SearchTipsProps {
  i18n: i18n;
}

export const renderSearchTips: FunctionalComponent<SearchTipsProps> = ({
  props,
}) => {
  return html`
    <div class="text-neutral-dark my-2 text-center text-lg" part="search-tips">
      ${props.i18n.t('search-tips')}
    </div>
  `;
};
