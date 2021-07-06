import {FunctionalComponent, h} from '@stencil/core';
import {FacetValueProps} from '../facet-common';
import {highlightSearchResult} from '../facet-search/facet-search-utils';

export const FacetValueLink: FunctionalComponent<FacetValueProps> = (props) => {
  const count = props.numberOfResults.toLocaleString(props.i18n.language);
  const ariaLabel = props.i18n.t('facetValue', {
    value: props.displayValue,
    count: props.numberOfResults,
  });

  return (
    <li key={props.displayValue}>
      <button
        part="value-link"
        onClick={() => props.onClick()}
        class="value-link w-full flex items-baseline py-2.5 text-on-background ellipsed focus:outline-none"
        aria-pressed={props.isSelected.toString()}
        aria-label={ariaLabel}
      >
        <span
          title={props.displayValue}
          part="value-label"
          class={`value-label ellipsed ${props.isSelected ? 'font-bold' : ''}`}
          innerHTML={highlightSearchResult(
            props.displayValue,
            props.searchQuery
          )}
        ></span>
        <span
          part="value-count"
          class="ml-1.5 text-neutral-dark with-parentheses"
        >
          {count}
        </span>
      </button>
    </li>
  );
};
