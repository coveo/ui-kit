import '@/src/components/common/atomic-icon/atomic-icon';
import type {i18n} from 'i18next';
import {html} from 'lit';
import {renderButton} from '@/src/components/common/button';
import {renderFacetValueLabelHighlight} from '@/src/components/common/facets/facet-value-label-highlight/facet-value-label-highlight';
import {hierarchicalPath} from '@/src/directives/hierarchical-path';
import {getFieldValueCaption} from '@/src/utils/field-utils';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {getAllCategoriesLocalizedLabel} from './all-categories-localized-label';

interface CategoryFacetSearchValueProps {
  value: {count: number; path: string[]; displayValue: string};
  i18n: i18n;
  field: string;
  facetId?: string;
  onClick(): void;
  searchQuery: string;
}

const SEPARATOR = '/';
const PATH_MAX_LENGTH = 3;

export const renderCategoryFacetSearchValue: FunctionalComponent<
  CategoryFacetSearchValueProps
> = ({props}) => {
  const count = props.value.count.toLocaleString(props.i18n.language);
  const inLabel = props.i18n.t('in');
  const allCategories = getAllCategoriesLocalizedLabel({
    facetId: props.facetId,
    field: props.field,
    i18n: props.i18n,
  });
  const localizedPath = props.value.path.length
    ? props.value.path.map((value) =>
        getFieldValueCaption(props.field, value, props.i18n)
      )
    : [allCategories];
  const ariaLabel = props.i18n.t('under', {
    child: props.i18n.t('facet-value', {
      count: props.value.count,
      formattedCount: count,
      value: props.value.displayValue,
    }),
    parent: localizedPath.join(', '),
  });

  return html`<li data-key=${props.value.displayValue}>
    ${renderButton({
      props: {
        style: 'text-neutral',
        part: 'search-result',
        onClick: () => props.onClick(),
        class:
          'group flex w-full flex-col truncate px-2 py-2.5 focus-visible:outline-none',
        ariaLabel,
      },
    })(html`
      <div class="flex w-full">
        ${renderFacetValueLabelHighlight({
          props: {
            displayValue: props.value.displayValue,
            isSelected: false,
            searchQuery: props.searchQuery,
          },
        })}
        <span part="value-count" class="value-count">
          ${props.i18n.t('between-parentheses', {
            text: count,
          })}
        </span>
      </div>
      <div
        part="search-result-path"
        class="text-neutral-dark group-focus:text-primary group-hover:text-primary mt-1 flex w-full"
      >
        <span class="mr-0.5">${inLabel}</span>
        ${hierarchicalPath({
          path: localizedPath,
          separator: SEPARATOR,
          maxLength: PATH_MAX_LENGTH,
          emptyPathContent: html`<span class="truncate">
            ${inLabel} ${allCategories}
          </span>`,
          separatorClass: 'mx-0.5',
          itemClass: 'max-w-max flex-1 truncate',
          ellipsisClass: '',
        })}
      </div>
    `)}
  </li>`;
};

export type {CategoryFacetSearchValueProps};
