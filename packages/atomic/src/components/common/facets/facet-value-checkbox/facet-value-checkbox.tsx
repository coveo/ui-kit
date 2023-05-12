import {FunctionalComponent, h} from '@stencil/core';
import {createRipple} from '../../../../utils/ripple';
import {randomID} from '../../../../utils/utils';
import {Checkbox} from '../../checkbox';
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
    interpolation: {escapeValue: false},
  });
  let labelRef: HTMLLabelElement;

  return (
    <li key={props.displayValue} class="relative flex items-center">
      <Checkbox
        id={id}
        checked={props.isSelected}
        onToggle={() => props.onClick()}
        part="value-checkbox"
        class="value-checkbox"
        ariaLabel={ariaLabel}
        ref={props.buttonRef}
        onMouseDown={(e) =>
          createRipple(e, {color: 'neutral', parent: labelRef})
        }
        iconPart="value-checkbox-icon"
      />
      <label
        ref={(ref) => (labelRef = ref!)}
        htmlFor={id}
        part="value-checkbox-label"
        class="group items-center"
        onMouseDown={(e) => createRipple(e, {color: 'neutral'})}
        aria-hidden="true"
      >
        {children}
        <span part="value-count" class="value-count">
          {props.i18n.t('between-parentheses', {
            text: count,
          })}
        </span>
      </label>
    </li>
  );
};
