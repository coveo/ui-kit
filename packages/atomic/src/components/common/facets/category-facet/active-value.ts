import type {i18n} from 'i18next';
import {html} from 'lit';
import {keyed} from 'lit/directives/keyed.js';
import {ref} from 'lit/directives/ref.js';
import {renderFacetValueLabelHighlight} from '@/src/components/common/facets/facet-value-label-highlight/facet-value-label-highlight';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';

interface CategoryFacetActiveValueProps {
  displayValue: string;
  numberOfResults: number;
  i18n: i18n;
  searchQuery: string;
  isLeafValue: boolean;
  setRef: (el?: Element) => void;
}

/**
 * Renders the deepest selected value of a category facet.
 *
 * The value is not interactive: it represents the filter that is already applied, and it is
 * removed from the facet's clear button rather than by clicking it again. `tabindex="-1"`
 * keeps it a valid target for the focus moved here once the query resolves.
 */
export const renderCategoryFacetActiveValue: FunctionalComponentWithChildren<
  CategoryFacetActiveValueProps
> =
  ({props: {displayValue, numberOfResults, i18n, searchQuery, isLeafValue, setRef}}) =>
  (children) => {
    const count = numberOfResults.toLocaleString(i18n.language);

    return html`${keyed(
      displayValue,
      html`<li class="contents">
        <span
          part="active-parent ${isLeafValue ? 'leaf-value' : 'node-value'}"
          class="text-primary flex w-full items-center truncate px-2 py-2.5 text-left"
          aria-current="true"
          tabindex="-1"
          ${ref(setRef)}
        >
          ${renderFacetValueLabelHighlight({
            props: {displayValue, searchQuery, isSelected: true},
          })}
          <span part="value-count" class="value-count">
            ${i18n.t('between-parentheses', {text: count})}
          </span>
        </span>
        ${children}
      </li>`
    )}`;
  };

export type {CategoryFacetActiveValueProps};
