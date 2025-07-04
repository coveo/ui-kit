import {type FunctionalComponent, h} from '@stencil/core';
import type {i18n} from 'i18next';
import LeftArrow from '../../../../images/arrow-left-rounded.svg';
import {Button} from '../../stencil-button';

interface CategoryFacetAllCategoryButtonProps {
  i18n: i18n;
  onClick(): void;
}

export const CategoryFacetAllCategoryButton: FunctionalComponent<
  CategoryFacetAllCategoryButtonProps
> = ({i18n, onClick}) => {
  const allCategories = i18n.t('all-categories');
  return (
    <Button
      style="text-neutral"
      part="all-categories-button"
      onClick={() => {
        onClick();
      }}
    >
      <atomic-icon icon={LeftArrow} part="back-arrow"></atomic-icon>
      <span class="truncate">{allCategories}</span>
    </Button>
  );
};
