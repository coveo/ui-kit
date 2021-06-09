import {FunctionalComponent, h} from '@stencil/core';
import {randomID} from '../../../utils/utils';
import {FacetValueProps} from '../facet-common';

export const FacetValueCheckbox: FunctionalComponent<FacetValueProps> = (
  props
) => {
  const id = randomID('facet-value-');
  const isSelected = props.state === 'selected';
  const count = props.numberOfResults.toLocaleString(props.i18n.language);
  const ariaLabel = props.i18n.t('facetValue', {
    value: props.displayValue,
    count: props.numberOfResults,
  });
  return (
    <li key={props.displayValue} part="value" class="flex items-center">
      <button
        id={id}
        role="checkbox"
        onClick={() => props.onClick()}
        aria-checked={isSelected.toString()}
        class={`value-box flex justify-center rounded border border-neutral-dark focus:outline-none focus:border-primary-light ${
          isSelected ? 'selected bg-primary border-none' : ''
        }`}
        aria-label={ariaLabel}
      ></button>
      <label
        htmlFor={id}
        class="w-full flex pl-2 py-2.5 text-on-background cursor-pointer ellipsed"
      >
        <span
          title={props.displayValue}
          part="value-label"
          class="value-label ellipsed"
        >
          {props.displayValue}
        </span>
        <span
          part="value-count"
          class="ml-1.5 text-neutral-dark with-parentheses"
        >
          {count}
        </span>
      </label>
    </li>
  );
};
