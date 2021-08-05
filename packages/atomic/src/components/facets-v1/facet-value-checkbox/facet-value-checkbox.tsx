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
    <li key={props.displayValue} class="relative flex items-center">
      <button
        id={id}
        role="checkbox"
        part="value-checkbox"
        onClick={() => props.onClick()}
        aria-checked={props.isSelected.toString()}
        class={`value-checkbox ${
          props.isSelected
            ? 'selected bg-primary'
            : 'border border-neutral-dark'
        }`}
        aria-label={ariaLabel}
      ></button>
      <label htmlFor={id} part="value-checkbox-label">
        {children}
        <span part="value-count" class="value-count">
          {count}
        </span>
      </label>
    </li>
  );
};
