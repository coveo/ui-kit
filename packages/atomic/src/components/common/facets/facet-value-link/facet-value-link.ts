import {html, type TemplateResult} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {keyed} from 'lit/directives/keyed.js';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import {renderButton} from '../../button';
import type {FacetValuePropsBase} from '../facet-common';

export interface FacetValueLinkProps extends FacetValuePropsBase {
  subList?: TemplateResult;
}

export const renderFacetValueLink: FunctionalComponentWithChildren<
  FacetValueLinkProps
> =
  ({props}) =>
  (children) => {
    const count = props.numberOfResults.toLocaleString(props.i18n.language);
    const ariaLabel = props.i18n.t('facet-value', {
      value: props.displayValue,
      count: props.numberOfResults,
      formattedCount: count,
      interpolation: {escapeValue: false},
    });

    let part =
      props.part ??
      `value-link${props.isSelected ? ' value-link-selected' : ''}`;

    if (props.additionalPart) {
      part += ` ${props.additionalPart}`;
    }

    return html`
      ${keyed(
        props.displayValue,
        html`<li class=${ifDefined(props.class)} role="none">
          ${renderButton({
            props: {
              style: 'text-neutral',
              part,
              onClick: () => props.onClick(),
              class:
                'group flex w-full items-center truncate px-2 py-2.5 text-left focus-visible:outline-none',
              role: props.role,
              ariaPressed: props.isSelected ? 'true' : 'false',
              ariaLevel: props.ariaLevel,
              ariaLabel,
              ariaExpanded: props.ariaExpanded,
              dataTreeKind: props.dataTreeKind,
              dataTreePath: props.dataTreePath,
              ref: props.buttonRef,
            },
          })(
            html`${children}<span part="value-count" class="value-count">
                ${props.i18n.t('between-parentheses', {
                  text: count,
                })}
              </span>`
          )}
          ${props.subList}
        </li>`
      )}
    `;
  };
