import {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import {html} from 'lit';
import {ref} from 'lit/directives/ref.js';
import {createRipple} from '../../../../utils/ripple';
import {randomID} from '../../../../utils/utils';
import {checkbox} from '../../checkbox';
import {renderTriStateCheckbox} from '../../triStateCheckbox';
import {FacetValueProps} from '../facet-common';
import {renderFacetValueExclude} from '../facet-value-exclude/facet-value-exclude';

type TriStateFacetValueProps = Omit<FacetValueProps, 'isSelected'> & {
  state: 'idle' | 'selected' | 'excluded';
  onExclude(): void;
};

export const renderFacetValueCheckbox: FunctionalComponentWithChildren<
  FacetValueProps | TriStateFacetValueProps
> =
  ({props}) =>
  (children) => {
    const id = randomID('facet-value-');
    const count = props.numberOfResults.toLocaleString(props.i18n.language);
    const ariaLabelAttributes = {
      value: props.displayValue,
      count: props.numberOfResults,
      interpolation: {escapeValue: false},
    };
    const selectedAriaLabel = props.i18n.t('facet-value', ariaLabelAttributes);
    const excludedAriaLabel = props.i18n.t(
      'facet-value-exclude',
      ariaLabelAttributes
    );
    let labelRef: HTMLLabelElement;

    const isTriStateCheckbox = (
      a: FacetValueProps | TriStateFacetValueProps
    ): a is TriStateFacetValueProps => {
      return 'state' in a && 'isSelected' in a;
    };

    const renderCheckbox = () => {
      const attributes = {
        id,
        onToggle: () => props.onClick(),
        part: 'value-checkbox',
        class: 'value-checkbox',
        ariaLabel: selectedAriaLabel,
        // ref: props.buttonRef,
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
      <li .key=${props.displayValue} class="relative flex items-center">
        ${renderCheckbox()}
        <!-- TODO: check for label ref. maybe should be using createRef -->
        <label
          ${ref((ref) => (labelRef = ref as HTMLLabelElement))}
          .htmlFor=${id}
          part="value-checkbox-label"
          class="group items-center"
          onMouseDown=${(e: MouseEvent) => createRipple(e, {color: 'neutral'})}
          aria-hidden="true"
        >
          ${children} ${renderExclusion()}
          <span part="value-count" class="value-count">
            ${props.i18n.t('between-parentheses', {
              text: count,
            })}
          </span>
        </label>
      </li>
    `;
  };
