import {html} from 'lit';
import {keyed} from 'lit/directives/keyed.js';
import {ref} from 'lit/directives/ref.js';
import type {FacetValuePropsBase} from '@/src/components/common/facets/facet-common';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import {createRipple} from '@/src/utils/ripple-utils';
import {randomID} from '@/src/utils/utils';

export const renderColorFacetCheckbox: FunctionalComponentWithChildren<
  FacetValuePropsBase
> =
  ({props}) =>
  (children) => {
    const id = randomID('facet-value-');
    const count = props.numberOfResults.toLocaleString(props.i18n.language);
    const ariaLabel = props.i18n.t('facet-value', {
      value: props.displayValue,
      count: props.numberOfResults,
      formattedCount: count,
    });
    const partValue = props.displayValue
      .match(/-?[_a-zA-Z]+[_a-zA-Z0-9-]*/)
      ?.toString();
    let labelRef: HTMLLabelElement;

    return html`
      ${keyed(
        props.displayValue,
        html`<li class="relative flex items-center">
          <button
            id=${id}
            role="checkbox"
            part=${`value-checkbox value-${partValue}${
              props.isSelected ? ' value-checkbox-checked' : ''
            }`}
            @click=${() => props.onClick()}
            @mousedown=${(e: MouseEvent) =>
              createRipple(e, {color: 'neutral', parent: labelRef})}
            aria-checked=${getAriaCheckedValue(props.isSelected)}
            class=${`value-checkbox ${props.isSelected ? 'ring-primary' : ''}`}
            aria-label=${ariaLabel}
          ></button>
          <label
            ${ref((ref) => {
              labelRef = ref as HTMLLabelElement;
            })}
            .htmlFor=${id}
            part="value-checkbox-label"
            @mousedown=${(e: MouseEvent) => createRipple(e, {color: 'neutral'})}
          >
            ${children}
            <span part="value-count" class="value-count">
              ${props.i18n.t('between-parentheses', {
                text: count,
              })}
            </span>
          </label>
        </li>`
      )}
    `;
  };

const getAriaCheckedValue = (isSelected: boolean) => {
  return isSelected ? 'true' : 'false';
};
