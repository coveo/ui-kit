import {FunctionalComponent, h} from '@stencil/core';
import {FacetValueProps} from '../facet-common';

export const FacetValueBox: FunctionalComponent<FacetValueProps> = (props) => {
  const count = props.numberOfResults.toLocaleString(props.i18n.language);
  const ariaLabel = props.i18n.t('facetValue', {
    value: props.displayValue,
    count: props.numberOfResults,
  });

  return (
    <li key={props.displayValue}>
      <button
        part="value-box"
        onClick={() => props.onClick()}
        class={`value-box w-full flex flex-col rounded text-on-background hover:border-primary-light focus:border-primary-light focus:outline-none py-2 px-1 ${
          props.isSelected ? 'border-primary border-2' : 'border border-neutral'
        }`}
        aria-pressed={props.isSelected.toString()}
        aria-label={ariaLabel}
      >
        <span
          title={props.displayValue}
          part="value-label"
          class={`value-label ellipsed w-full ${
            props.isSelected ? 'font-bold' : ''
          }`}
        >
          {props.displayValue}
        </span>
        <span
          part="value-count"
          class="text-neutral-dark with-parentheses w-full text-sm mt-1"
        >
          {count}
        </span>
      </button>
    </li>
  );
};
