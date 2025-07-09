import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {keyed} from 'lit/directives/keyed.js';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import {renderButton} from '../../button';
import type {FacetValuePropsBase} from '../facet-common';

export const renderFacetValueBox: FunctionalComponentWithChildren<
  FacetValuePropsBase
> =
  ({props}) =>
  (children) => {
    const compactCount = new Intl.NumberFormat(props.i18n.language, {
      notation: 'compact',
    }).format(props.numberOfResults);

    const ariaLabel = props.i18n.t('facet-value', {
      value: props.displayValue,
      count: props.numberOfResults,
      formattedCount: compactCount,
    });

    return html`
      ${keyed(
        props.displayValue,
        html`<li .key=${props.displayValue} class=${ifDefined(props.class)}>
          ${renderButton({
            props: {
              style: 'outline-bg-neutral',
              part: `value-box${props.isSelected ? ' value-box-selected' : ''}`,
              onClick: () => props.onClick(),
              class: `value-box group box-border h-full w-full items-center p-2 ${
                props.isSelected ? 'selected' : ''
              }`,
              ariaPressed: props.isSelected ? 'true' : 'false',
              ariaLabel,
              ref: props.buttonRef,
            },
          })(
            html`${children}<span
                part="value-count"
                class="value-box-count text-neutral-dark mt-1 w-full truncate text-sm"
              >
                ${props.i18n.t('between-parentheses', {
                  text: compactCount,
                })}
              </span>`
          )}
        </li>`
      )}
    `;
  };
