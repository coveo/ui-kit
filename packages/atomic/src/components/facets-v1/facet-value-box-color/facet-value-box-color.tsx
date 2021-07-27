import {FunctionalComponent, h} from '@stencil/core';
import {FacetColorValueProps} from '../facet-common';

export const FacetValueBoxColor: FunctionalComponent<FacetColorValueProps> = (
  props,
  children
) => {
  const count = props.numberOfResults.toLocaleString(props.i18n.language);
  const ariaLabel = props.i18n.t('facet-value', {
    value: props.displayValue,
    count: props.numberOfResults,
  });

  return (
    <li key={props.displayValue}>
      <button
        part="value-box"
        onClick={() => props.onClick()}
        class={`value-box box-border w-full h-full flex flex-col items-center rounded text-on-background hover:border-primary-light focus:border-primary-light focus:outline-none py-2 px-1 overflow-hidden ${
          props.isSelected ? 'border-primary border-2' : 'border border-neutral'
        }`}
        aria-pressed={props.isSelected.toString()}
        aria-label={ariaLabel}
      >
        <div
          part={`value-${props.partValue}`}
          class="w-full h-1/2 bg-neutral-dark m-2"
        ></div>
        {children}
        <span
          title={count}
          part="value-count"
          class="text-neutral-dark ellipsed with-parentheses w-full text-sm mt-1"
        >
          {count}
        </span>
      </button>
    </li>
  );
};
