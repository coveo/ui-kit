import {FunctionalComponent, h} from '@stencil/core';
import {randomID} from '../../../utils/utils';
import {FacetValueProps} from '../facet-common';

export const FacetValueCheckbox: FunctionalComponent<FacetValueProps> = (
  props,
  children
) => {
  const id = randomID('facet-value-');
  const count = props.numberOfResults.toLocaleString(props.i18n.language);
  const ariaLabel = props.i18n.t('facet-value', {
    value: props.displayValue,
    count: props.numberOfResults,
  });

  return (
    <li key={props.displayValue} class="flex items-center">
      <button
        id={id}
        role="checkbox"
        part="value-checkbox"
        onClick={() => props.onClick()}
        aria-checked={props.isSelected.toString()}
        class={`value-checkbox flex justify-center rounded focus:outline-none focus:border-primary-light ${
          props.isSelected
            ? 'selected bg-primary'
            : 'border border-neutral-dark'
        }`}
        aria-label={ariaLabel}
      ></button>
      <label
        htmlFor={id}
        part="value-checkbox-label"
        class="w-full flex items-center pl-2 py-2.5 text-on-background cursor-pointer ellipsed"
      >
        {children}
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
