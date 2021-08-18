import {FunctionalComponent, h} from '@stencil/core';
import {Button} from '../../common/button';
import {FacetValueProps} from '../facet-common';

export const FacetValueBox: FunctionalComponent<FacetValueProps> = (
  props,
  children
) => {
  const count = props.numberOfResults.toLocaleString(props.i18n.language);
  const ariaLabel = props.i18n.t('facet-value', {
    value: props.displayValue,
    count: props.numberOfResults,
  });

  return (
    <li key={props.displayValue}>
      <Button
        style="outline-bg-neutral"
        part="value-box"
        onClick={() => props.onClick()}
        class={`value-box box-border w-full h-full flex flex-col items-center p-2 group ${
          props.isSelected ? 'selected' : ''
        }`}
        ariaPressed={props.isSelected.toString()}
        ariaLabel={ariaLabel}
      >
        {children}
        <span
          title={count}
          part="value-count"
          class="text-neutral-dark truncate with-parentheses w-full text-sm mt-1"
        >
          {count}
        </span>
      </Button>
    </li>
  );
};
