import {html} from 'lit';
import {keyed} from 'lit/directives/keyed.js';
import {renderButton} from '@/src/components/common/button';
import type {FacetValuePropsBase} from '@/src/components/common/facets/facet-common';
import {multiClassMap, tw} from '@/src/directives/multi-class-map';
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
    formattedCount: compactCount,
  });

  const labelClasses = tw({
    'value-label truncate': true,
    'text-primary': props.isSelected,
    'group-hover:text-primary-light group-focus:text-primary':
      !props.isSelected,
  });

  const countClasses = tw({
    'value-box-count mt-0 w-auto truncate pl-1 text-sm': true,
    'text-primary': props.isSelected,
    'text-neutral-dark group-hover:text-primary-light group-focus:text-primary':
      !props.isSelected,
  });

  const buttonClasses = tw({
    'value-box group box-border flex h-full items-center p-2': true,
    'selected border-primary shadow-inner-primary': props.isSelected,
    'hover:border-primary-light focus-visible:border-primary-light':
      !props.isSelected,
  });

  const buttonClassString = Object.entries(buttonClasses)
    .filter(([, value]) => value)
    .map(([key]) => key)
    .join(' ');

  return html`
    ${keyed(
      props.displayValue,
      html`<li>
        ${renderButton({
          props: {
            style: 'square-neutral',
            part: `value-box${props.isSelected ? ' value-box-selected' : ''}`,
            onClick: () => props.onClick(),
            class: buttonClassString,
            ariaPressed: props.isSelected ? 'true' : 'false',
            ariaLabel,
            ref: props.buttonRef,
          },
        })(
          html`<span
              title=${props.displayValue}
              part="value-label"
              class=${multiClassMap(labelClasses)}
            >
              ${props.displayValue}
            </span>
            <span
              title=${count}
              part="value-count"
              class=${multiClassMap(countClasses)}
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
