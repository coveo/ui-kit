import {FunctionalComponent, h} from '@stencil/core';
import {randomID} from '../../../utils/utils';
import {FacetValueProps} from '../facet-common';

export const FacetValueCheckboxRating: FunctionalComponent<FacetValueProps> = (
  props,
  children
) => {
  const id = randomID('facet-value-');
  const count = props.numberOfResults.toLocaleString(props.i18n.language);
  const ariaLabel = props.i18n.t('facetValue', {
    value: props.displayValue,
    count: props.numberOfResults,
  });

  return (
    <li key={id} class="flex items-center">
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
        <div class="flex items-center gap-0.5 pt-0.5 pb-0.5" part="value-label">
          {children}
        </div>
        <span
          part="value-count"
          class="ml-1.5 text-neutral-dark with-parentheses align-middle"
        >
          {count}
        </span>
      </label>
    </li>
  );
};
