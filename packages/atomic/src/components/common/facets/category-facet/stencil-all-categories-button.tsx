import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import LeftArrow from '../../../../images/arrow-left-rounded.svg';
import {Button} from '../../stencil-button';
import { getAllCategoriesLocalizedLabel } from './all-categories-localized-label';

interface CategoryFacetAllCategoryButtonProps {
  i18n: i18n;
  onClick(): void;
  facetId?: string;
  field: string;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const CategoryFacetAllCategoryButton: FunctionalComponent<
  CategoryFacetAllCategoryButtonProps
> = ({i18n, onClick, facetId, field}) => {
  const allCategories = getAllCategoriesLocalizedLabel({facetId, field, i18n});
  return (
    <Button
      style="text-neutral"
      part="all-categories-button"
      onClick={() => {
        onClick();
      }}
    >
      <atomic-icon
        aria-hidden="true"
        icon={LeftArrow}
        part="back-arrow"
      ></atomic-icon>
      <span class="truncate">{allCategories}</span>
    </Button>
  );
};
