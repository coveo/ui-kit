import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import {getFieldValueCaption} from '../../../../utils/field-utils';
import {Button} from '../../stencil-button';
import {FacetValueLabelHighlight} from '../facet-value-label-highlight/stencil-facet-value-label-highlight';
import { getAllCategoriesLocalizedLabel } from './all-categories-localized-label';
interface CategoryFacetSearchValueProps {
  value: {count: number; path: string[]; displayValue: string};
  i18n: i18n;
  field: string;
  facetId?: string;
  onClick(): void;
  searchQuery: string;
}

const SEPARATOR = '/';
const ELLIPSIS = '...';
const PATH_MAX_LENGTH = 3;

/**
 * @deprecated should only be used for Stencil components.
 */
export const CategoryFacetSearchValue: FunctionalComponent<
  CategoryFacetSearchValueProps
> = ({value, facetId, field, i18n, onClick, searchQuery}) => {
  const count = value.count.toLocaleString(i18n.language);
  const inLabel = i18n.t('in');
  const allCategories = getAllCategoriesLocalizedLabel({facetId, field, i18n});
  const localizedPath = value.path.length
    ? value.path.map((value) => getFieldValueCaption(field, value, i18n))
    : [allCategories];
  const ariaLabel = i18n.t('under', {
    child: i18n.t('facet-value', {
      count: value.count,
      formattedCount: count,
      value: value.displayValue,
    }),
    parent: localizedPath.join(', '),
  });

  function ellipsedPath(path: string[]) {
    if (path.length <= PATH_MAX_LENGTH) {
      return path;
    }
    const firstPart = path.slice(0, 1);
    const lastParts = path.slice(-PATH_MAX_LENGTH + 1);
    return firstPart.concat(ELLIPSIS, ...lastParts);
  }

  function renderPath(path: string[]) {
    if (!path.length) {
      return <span class="truncate">{`${inLabel} ${allCategories}`}</span>;
    }

    return [
      <span class="mr-0.5">{inLabel}</span>,
      ellipsedPath(path).map((value, index) => [
        index > 0 && <span class="mx-0.5">{SEPARATOR}</span>,
        <span class={value === ELLIPSIS ? '' : 'max-w-max flex-1 truncate'}>
          {value}
        </span>,
      ]),
    ];
  }

  return (
    <li key={value.displayValue}>
      <Button
        style="text-neutral"
        part="search-result"
        onClick={() => onClick()}
        class="group flex w-full flex-col truncate px-2 py-2.5 focus-visible:outline-none"
        aria-label={ariaLabel}
      >
        <div class="flex w-full">
          <FacetValueLabelHighlight
            displayValue={value.displayValue}
            isSelected={false}
            searchQuery={searchQuery}
          ></FacetValueLabelHighlight>
          <span part="value-count" class="value-count">
            {i18n.t('between-parentheses', {
              text: count,
            })}
          </span>
        </div>
        <div
          part="search-result-path"
          class="text-neutral-dark group-focus:text-primary group-hover:text-primary mt-1 flex w-full"
        >
          {renderPath(localizedPath)}
        </div>
      </Button>
    </li>
  );
};
