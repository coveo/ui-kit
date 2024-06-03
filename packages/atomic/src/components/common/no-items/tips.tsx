import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';

interface SearchTipsProps {
  i18n: i18n;
}
export const SearchTips: FunctionalComponent<SearchTipsProps> = ({i18n}) => {
  return (
    <div class="my-2 text-lg text-neutral-dark text-center" part="search-tips">
      {i18n.t('search-tips')}
    </div>
  );
};
