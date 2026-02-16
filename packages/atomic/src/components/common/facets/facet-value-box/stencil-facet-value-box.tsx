import {FunctionalComponent, h} from '@stencil/core';
import {Button} from '../../stencil-button';
import {FacetValueProps} from '../stencil-facet-common';

/**
 * @deprecated should only be used for Stencil components.
 */
export const FacetValueBox: FunctionalComponent<FacetValueProps> = (
  props,
  children
) => {
  const compactCount = new Intl.NumberFormat(props.i18n.language, {
    notation: 'compact',
  }).format(props.numberOfResults);

  const count = props.numberOfResults.toLocaleString(props.i18n.language);

  const ariaLabel = props.i18n.t('facet-value', {
    value: props.displayValue,
    count: props.numberOfResults,
    formattedCount: compactCount,
  });

  return (
    <li key={props.displayValue}>
      <Button
        style="outline-bg-neutral"
        part={`value-box${props.isSelected ? ' value-box-selected' : ''}`}
        onClick={() => props.onClick()}
        class={`value-box group box-border h-full w-full items-center p-2 ${
          props.isSelected ? 'selected' : ''
        }`}
        ariaPressed={props.isSelected.toString()}
        ariaLabel={ariaLabel}
        ref={props.buttonRef}
      >
        {children}
        <span
          title={count}
          part="value-count"
          class="value-box-count text-neutral-dark mt-1 w-full truncate text-sm"
        >
          {props.i18n.t('between-parentheses', {
            text: compactCount,
          })}
        </span>
      </Button>
    </li>
  );
};
