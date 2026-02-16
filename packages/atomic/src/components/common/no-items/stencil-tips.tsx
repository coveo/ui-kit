import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';

interface SearchTipsProps {
  i18n: i18n;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const SearchTips: FunctionalComponent<SearchTipsProps> = ({i18n}) => {
  return (
    <div class="text-neutral-dark my-2 text-center text-lg" part="search-tips">
      {i18n.t('search-tips')}
    </div>
  );
};
