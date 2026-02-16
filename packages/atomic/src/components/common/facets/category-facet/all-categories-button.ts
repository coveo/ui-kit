import '@/src/components/common/atomic-icon/atomic-icon';
import type {i18n} from 'i18next';
import {html} from 'lit';
import {renderButton} from '@/src/components/common/button';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import LeftArrow from '../../../../images/arrow-left-rounded.svg';
import {getAllCategoriesLocalizedLabel} from './all-categories-localized-label';

export interface CategoryFacetAllCategoryButtonProps {
  i18n: i18n;
  facetId?: string;
  field: string;
  onClick(): void;
}

export const renderCategoryFacetAllCategoryButton: FunctionalComponent<
  CategoryFacetAllCategoryButtonProps
> = ({props: {i18n, onClick, facetId, field}}) => {
  const allCategories = getAllCategoriesLocalizedLabel({facetId, field, i18n});
  return html`
    ${renderButton({
      props: {
        style: 'text-neutral',
        part: 'all-categories-button',
        onClick: onClick,
      },
    })(
      html`<atomic-icon
          aria-hidden="true"
          icon=${LeftArrow}
          part="back-arrow"
        ></atomic-icon>
        <span class="truncate">${allCategories}</span>`
    )}
  `;
};
