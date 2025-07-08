import type {i18n} from 'i18next';
import {html} from 'lit';
import type {TemplateResult} from 'lit';
import LeftArrow from '../../../../images/arrow-left-rounded.svg';
import '../../../common/atomic-icon/atomic-icon';
import {renderButton} from '../../button';

export interface CategoryFacetAllCategoryButtonProps {
  i18n: i18n;
  onClick(): void;
}

export const renderCategoryFacetAllCategoryButton = ({
  i18n,
  onClick,
}: CategoryFacetAllCategoryButtonProps): TemplateResult => {
  const allCategories = i18n.t('all-categories');
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
