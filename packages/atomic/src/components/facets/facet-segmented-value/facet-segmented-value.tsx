import {FunctionalComponent, h} from '@stencil/core';
import {Button} from '../../common/button';
import {FacetValueProps} from '../facet-common';

export const FacetSegmentedValue: FunctionalComponent<FacetValueProps> = (
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
  });

  return (
    <li key={props.displayValue}>
      <Button
        style="square-neutral"
        part="value-box"
        onClick={() => props.onClick()}
        class={`value-box flex box-border h-full items-center p-2 group ${
          props.isSelected ? 'selected' : ''
        }`}
        ariaPressed={props.isSelected.toString()}
        ariaLabel={ariaLabel}
      >
        {children}
        <span
          title={count}
          part="value-count"
          class="value-box-count text-neutral-dark truncate pl-1 w-auto mt-0 text-sm"
        >
          {props.i18n.t('between-parentheses', {
            text: compactCount,
          })}
        </span>
      </Button>
    </li>
  );
};
