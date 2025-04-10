import {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {renderButton} from '../../button';
import {FacetValueProps} from '../facet-common';

export const renderFacetValueBox: FunctionalComponentWithChildren<
  FacetValueProps
> =
  ({props}) =>
  (children) => {
    const compactCount = new Intl.NumberFormat(props.i18n.language, {
      notation: 'compact',
    }).format(props.numberOfResults);

    const count = props.numberOfResults.toLocaleString(props.i18n.language);

    const ariaLabel = props.i18n.t('facet-value', {
      value: props.displayValue,
      count: props.numberOfResults,
    });

    return html`
      <li .key=${props.displayValue} class=${ifDefined(props.class)}>
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
              title=${count}
              part="value-count"
              class="value-box-count text-neutral-dark mt-1 w-full truncate text-sm"
            >
              ${props.i18n.t('between-parentheses', {
                text: compactCount,
              })}
            </span>`
        )}
      </li>
    `;
  };
