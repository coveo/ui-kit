import {html} from 'lit';
import {keyed} from 'lit/directives/keyed.js';
import {renderButton} from '@/src/components/common/button';
import type {FacetValuePropsBase} from '@/src/components/common/facets/facet-common';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

export const renderFacetSegmentedValue: FunctionalComponent<
  FacetValuePropsBase
> = ({props}) => {
  const compactCount = new Intl.NumberFormat(props.i18n.language, {
    notation: 'compact',
  }).format(props.numberOfResults);

  const count = props.numberOfResults.toLocaleString(props.i18n.language);

  const ariaLabel = props.i18n.t('facet-value', {
    value: props.displayValue,
    count: props.numberOfResults,
    formattedCount: count,
  });

  return html`
    ${keyed(
      props.displayValue,
      html`<li>
        ${renderButton({
          props: {
            style: 'square-neutral',
            part: `value-box${props.isSelected ? ' value-box-selected' : ''}`,
            onClick: () => props.onClick(),
            class: `value-box group box-border flex h-full items-center p-2 ${
              props.isSelected
                ? 'selected border-primary shadow-inner-primary'
                : 'hover:border-primary-light focus-visible:border-primary-light'
            }`,
            ariaPressed: props.isSelected ? 'true' : 'false',
            ariaLabel,
            ref: props.buttonRef,
          },
        })(html`
          <span
            title=${props.displayValue}
            part="value-label"
            class="value-label truncate ${
              props.isSelected
                ? 'text-primary'
                : 'group-hover:text-primary-light group-focus:text-primary'
            }"
          >
            ${props.displayValue}
          </span>
          <span
            title=${count}
            part="value-count"
            class="value-box-count mt-0 w-auto truncate pl-1 text-sm ${
              props.isSelected
                ? 'text-primary'
                : 'text-neutral-dark group-hover:text-primary-light group-focus:text-primary'
            }"
          >
            ${props.i18n.t('between-parentheses', {
              text: compactCount,
            })}
          </span>
        `)}
      </li>`
    )}
  `;
};
