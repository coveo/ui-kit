import {FunctionalComponent, h} from '@stencil/core';
import {Button} from '@components/common/button';
import {FacetValueProps} from '../facet-common';

export const FacetSegmentedValue: FunctionalComponent<FacetValueProps> = (
  props
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
          props.isSelected
            ? 'selected border-primary shadow-inner-primary'
            : 'hover:border-primary-light focus-visible:border-primary-light'
        }`}
        ariaPressed={props.isSelected.toString()}
        ariaLabel={ariaLabel}
      >
        <span
          title={props.displayValue}
          part="value-label"
          class={`value-label truncate ${
            props.isSelected
              ? 'text-primary'
              : 'group-hover:text-primary-light group-focus:text-primary'
          }`}
        >
          {props.displayValue}
        </span>
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
