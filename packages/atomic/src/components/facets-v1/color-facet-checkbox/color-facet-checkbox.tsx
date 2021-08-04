import {FunctionalComponent, h} from '@stencil/core';
import {randomID} from '../../../utils/utils';
import {FacetValueProps} from '../facet-common';

export const ColorFacetCheckbox: FunctionalComponent<FacetValueProps> = (
  props,
  children
) => {
  const id = randomID('facet-value-');
  const count = props.numberOfResults.toLocaleString(props.i18n.language);
  const ariaLabel = props.i18n.t('facet-value', {
    value: props.displayValue,
    count: props.numberOfResults,
  });
  const partValue = props.displayValue
    .match(new RegExp('-?[_a-zA-Z]+[_a-zA-Z0-9-]*'))
    ?.toString();

  return (
    <li key={props.displayValue} class="relative flex items-center">
      <button
        id={id}
        role="checkbox"
        part={`value-${partValue}`}
        onClick={() => props.onClick()}
        aria-checked={props.isSelected.toString()}
        class={`value-checkbox ${props.isSelected ? 'ring-primary' : ''}`}
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
