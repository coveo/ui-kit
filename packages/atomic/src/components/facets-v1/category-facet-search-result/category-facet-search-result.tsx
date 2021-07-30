import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import {getFieldValueCaption} from '../../../utils/field-utils';
import {FacetValueLabelHighlight} from '../facet-value-label-highlight/facet-value-label-highlight';

interface CategoryFacetSearchResultProps {
  path: string[];
  i18n: i18n;
  field: string;
  displayValue: string;
  numberOfResults: number;
  onClick(): void;
  searchQuery: string;
}

const SEPARATOR = '/';
const ELLIPSIS = '...';
const PATH_MAX_LENGTH = 3;

export const CategoryFacetSearchResult: FunctionalComponent<CategoryFacetSearchResultProps> = (
  props
) => {
  const count = props.numberOfResults.toLocaleString(props.i18n.language);
  const inLabel = props.i18n.t('in');
  const allCategories = props.i18n.t('all-categories');
  const localizedPath = props.path.length
    ? props.path.map((value) =>
        getFieldValueCaption(props.field, value, props.i18n)
      )
    : [allCategories];
  const ariaLabel = props.i18n.t('under', {
    child: props.i18n.t('facet-value', {
      numberOfResults: props.numberOfResults,
      value: props.displayValue,
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
      return <span class="ellipsed">{`${inLabel} ${allCategories}`}</span>;
    }

    return [
      <span class="mr-0.5">{inLabel}</span>,
      ellipsedPath(path).map((value, index) => [
        index > 0 && <span class="mx-0.5">{SEPARATOR}</span>,
        <span class={value === ELLIPSIS ? '' : 'ellipsed flex-1 max-w-max'}>
          {value}
        </span>,
      ]),
    ];
  }

  return (
    <li key={props.displayValue}>
      <button
        part="search-result"
        onClick={() => props.onClick()}
        class="search-result w-full flex flex-col py-2.5 text-on-background ellipsed focus:outline-none"
        aria-label={ariaLabel}
      >
        <div class="w-full flex">
          <FacetValueLabelHighlight
            displayValue={props.displayValue}
            isSelected={false}
            searchQuery={props.searchQuery}
          ></FacetValueLabelHighlight>
          <span
            part="value-count"
            class="ml-1.5 text-neutral-dark with-parentheses"
          >
            {count}
          </span>
        </div>
        <div
          part="search-result-path"
          class="search-result-path flex text-neutral-dark mt-1"
        >
          {renderPath(localizedPath)}
        </div>
      </button>
    </li>
  );
};
