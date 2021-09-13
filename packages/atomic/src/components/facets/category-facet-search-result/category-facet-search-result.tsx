import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import {CategoryFacetSearchResult as HeadlessCategoryFacetSearchResult} from '@coveo/headless';
import {getFieldValueCaption} from '../../../utils/field-utils';
import {FacetValueLabelHighlight} from '../facet-value-label-highlight/facet-value-label-highlight';
import {Button} from '../../common/button';

interface CategoryFacetSearchResultProps {
  result: HeadlessCategoryFacetSearchResult;
  i18n: i18n;
  field: string;
  onClick(): void;
  searchQuery: string;
}

const SEPARATOR = '/';
const ELLIPSIS = '...';
const PATH_MAX_LENGTH = 3;

export const CategoryFacetSearchResult: FunctionalComponent<CategoryFacetSearchResultProps> =
  ({result, field, i18n, onClick, searchQuery}) => {
    const count = result.count.toLocaleString(i18n.language);
    const inLabel = i18n.t('in');
    const allCategories = i18n.t('all-categories');
    const localizedPath = result.path.length
      ? result.path.map((value) => getFieldValueCaption(field, value, i18n))
      : [allCategories];
    const ariaLabel = i18n.t('under', {
      child: i18n.t('facet-value', {
        numberOfResults: result.count,
        value: result.displayValue,
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
          <span class={value === ELLIPSIS ? '' : 'truncate flex-1 max-w-max'}>
            {value}
          </span>,
        ]),
      ];
    }

    return (
      <li key={result.displayValue}>
        <Button
          style="text-neutral"
          part="search-result"
          onClick={() => onClick()}
          class="w-full flex flex-col px-2 py-2.5 truncate group no-outline"
          aria-label={ariaLabel}
        >
          <div class="w-full flex">
            <FacetValueLabelHighlight
              displayValue={result.displayValue}
              isSelected={false}
              searchQuery={searchQuery}
            ></FacetValueLabelHighlight>
            <span part="value-count" class="value-count">
              {count}
            </span>
          </div>
          <div
            part="search-result-path"
            class="flex w-full text-neutral-dark mt-1 group-focus:text-primary group-hover:text-primary"
          >
            {renderPath(localizedPath)}
          </div>
        </Button>
      </li>
    );
  };
