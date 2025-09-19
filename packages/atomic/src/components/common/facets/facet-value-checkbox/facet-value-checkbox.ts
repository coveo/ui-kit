import {html} from 'lit';
import {keyed} from 'lit/directives/keyed.js';
import {ref} from 'lit/directives/ref.js';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import {createRipple} from '../../../../utils/ripple-utils';
import {randomID} from '../../../../utils/utils';
import {renderCheckbox as checkbox} from '../../checkbox';
import {renderTriStateCheckbox} from '../../triStateCheckbox';
import type {FacetValuePropsBase} from '../facet-common';
import {renderFacetValueExclude} from '../facet-value-exclude/facet-value-exclude';

export type TriStateFacetValueProps = Omit<
  FacetValuePropsBase,
  'isSelected'
> & {
  state: 'idle' | 'selected' | 'excluded';
  onExclude(): void;
};

export const renderFacetValueCheckbox: FunctionalComponentWithChildren<
  FacetValuePropsBase | TriStateFacetValueProps
> =
  ({props}) =>
  (children) => {
    const id = randomID('facet-value-');
    const count = props.numberOfResults.toLocaleString(props.i18n.language);
    const ariaLabelAttributes = {
      value: props.displayValue,
      count: props.numberOfResults,
      formattedCount: count,
      interpolation: {escapeValue: false},
    };
    const selectedAriaLabel = props.i18n.t('facet-value', ariaLabelAttributes);
    const excludedAriaLabel = props.i18n.t(
      'facet-value-exclude',
      ariaLabelAttributes
    );
    let labelRef: HTMLLabelElement;

    const isTriStateCheckbox = (
      props: FacetValuePropsBase | TriStateFacetValueProps
    ): props is TriStateFacetValueProps => {
      return 'state' in props && 'isSelected' in props;
    };

    const renderCheckbox = () => {
      const attributes = {
        id,
        onToggle: () => props.onClick(),
        part: 'value-checkbox',
        class: 'value-checkbox',
        ariaLabel: selectedAriaLabel,
        ref: props.buttonRef,
        onMouseDown: (e: MouseEvent) =>
          createRipple(e, {color: 'neutral', parent: labelRef}),
        iconPart: 'value-checkbox-icon',
      };
      if (isTriStateCheckbox(props)) {
        return renderTriStateCheckbox({
          props: {
            ...attributes,
            state: props.state,
          },
        });
      }

      return checkbox({
        props: {
          ...attributes,
          checked: props.isSelected,
        },
      });
    };

    const renderExclusion = () => {
      if (isTriStateCheckbox(props)) {
        return renderFacetValueExclude({
          props: {
            onClick: () => props.onExclude?.(),
            ariaLabel: excludedAriaLabel,
          },
        });
      }
    };

    return html`
      ${keyed(
        props.displayValue,
        html`<li class="group relative flex items-center">
          ${renderCheckbox()}
          <label
            ${ref((ref) => {
              labelRef = ref as HTMLLabelElement;
            })}
            .htmlFor=${id}
            part="value-checkbox-label"
            class="items-center"
            @mousedown=${(e: MouseEvent) => createRipple(e, {color: 'neutral'})}
            aria-hidden="true"
          >
            ${children}
            <span part="value-count" class="value-count">
              ${props.i18n.t('between-parentheses', {
                text: count,
              })}
            </span>
          </label>
          ${renderExclusion()}
        </li>`
      )}
    `;
  };
