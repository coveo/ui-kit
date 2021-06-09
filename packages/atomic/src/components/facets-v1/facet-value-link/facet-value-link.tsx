import {FunctionalComponent, h} from '@stencil/core';
import {FacetValueProps} from '../facet-common';

export const FacetValueLink: FunctionalComponent<FacetValueProps> = (props) => {
  const isSelected = props.state === 'selected';
  const count = props.numberOfResults.toLocaleString(props.i18n.language);
  const ariaLabel = props.i18n.t('facetValue', {
    value: props.displayValue,
    count: props.numberOfResults,
  });
  return (
    <li key={props.displayValue} part="value">
      <button
        onClick={() => props.onClick()}
        class="link-value w-full flex items-center py-2.5 text-on-background ellipsed focus:outline-none"
        aria-pressed={isSelected.toString()}
        aria-label={ariaLabel}
      >
        <span
          title={props.displayValue}
          part="value-label"
          class={`value-label ellipsed ${isSelected ? 'font-bold' : ''}`}
        >
          {props.displayValue}
        </span>
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
