import {FunctionalComponent, h} from '@stencil/core';
import {createRipple} from '../../../utils/ripple';
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
  let labelRef: HTMLLabelElement;

  return (
    <li key={props.displayValue} class="relative flex items-center">
      <button
        id={id}
        role="checkbox"
        part={`value-${partValue}`}
        onClick={() => props.onClick()}
        onMouseDown={(e) =>
          createRipple(e, {color: 'neutral', parent: labelRef})
        }
        aria-checked={props.isSelected.toString()}
        class={`value-checkbox ${props.isSelected ? 'ring-primary' : ''}`}
        aria-label={ariaLabel}
      ></button>
      <label
        ref={(ref) => (labelRef = ref!)}
        htmlFor={id}
        part="value-checkbox-label"
        onMouseDown={(e) => createRipple(e, {color: 'neutral'})}
      >
        {children}
        <span part="value-count" class="value-count">
          {count}
        </span>
      </label>
    </li>
  );
};
