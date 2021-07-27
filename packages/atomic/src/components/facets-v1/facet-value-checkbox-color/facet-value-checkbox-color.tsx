import {FunctionalComponent, h} from '@stencil/core';
import {randomID} from '../../../utils/utils';
import {FacetColorValueProps} from '../facet-common';

export const FacetValueCheckboxColor: FunctionalComponent<FacetColorValueProps> = (
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
      <div
        class={props.isSelected ? 'border-2 border-primary-light rounded' : ''}
      >
        <button
          id={id}
          role="checkbox"
          part={`value-${props.partValue}`}
          onClick={() => props.onClick()}
          aria-checked={props.isSelected.toString()}
          class="value-checkbox m-0.5 flex justify-center rounded focus:outline-none focus:border-primary-light bg-neutral-dark"
          aria-label={ariaLabel}
        ></button>
      </div>
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
