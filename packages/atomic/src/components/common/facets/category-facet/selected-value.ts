import type {i18n} from 'i18next';
import {html} from 'lit';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import CloseIcon from '../../../../images/close.svg';
import '../../atomic-icon/atomic-icon';
import {renderButton} from '../../button';

interface CategoryFacetSelectedValueProps {
  /**
   * The localized label of the deepest selected value.
   */
  displayValue: string;
  /**
   * The localized label of the facet, used to describe the clear button.
   */
  label: string;
  i18n: i18n;
  onClearFilters(): void;
}

/**
 * Renders the deepest selected value of a category facet as a pill, next to a button that
 * clears the facet. This is what removes the filter, since the selected value itself is not
 * interactive once applied.
 */
export const renderCategoryFacetSelectedValue: FunctionalComponent<
  CategoryFacetSelectedValueProps
> = ({props: {displayValue, label, i18n, onClearFilters}}) => {
  return html`<div part="selected-value" class="mt-3 flex items-center justify-between gap-2">
    <span
      part="selected-value-pill"
      title=${displayValue}
      class="bg-neutral-light truncate rounded-md px-2 py-1 text-sm"
      >${displayValue}</span
    >
    ${renderButton({
      props: {
        part: 'selected-value-clear-button',
        style: 'text-primary',
        class: 'flex shrink-0 items-center p-1 text-sm',
        ariaLabel: i18n.t('clear-filters-for-facet', {count: 1, label}),
        onClick: onClearFilters,
      },
    })(
      html`<atomic-icon
          part="selected-value-clear-button-icon"
          class="mr-1 h-2 w-2"
          .icon=${CloseIcon}
        ></atomic-icon>
        <span>${i18n.t('clear')}</span>`
    )}
  </div>`;
};

export type {CategoryFacetSelectedValueProps};
