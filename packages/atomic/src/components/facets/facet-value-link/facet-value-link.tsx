import {FunctionalComponent, h} from '@stencil/core';
import {Button} from '../../common/button';
import {FacetValueProps} from '../facet-common';

export const FacetValueLink: FunctionalComponent<FacetValueProps> = (
  props,
  children
) => {
  const count = props.numberOfResults.toLocaleString(props.i18n.language);
  const ariaLabel = props.i18n.t('facet-value', {
    value: props.displayValue,
    count: props.numberOfResults,
    interpolation: {escapeValue: false},
  });

  return (
    <li key={props.displayValue} class={props.class}>
      <Button
        style="text-neutral"
        part={props.part ?? 'value-link'}
        onClick={() => props.onClick()}
        class="group w-full flex items-center px-2 py-2.5 text-left truncate no-outline"
        ariaPressed={props.isSelected.toString()}
        ariaLabel={ariaLabel}
        ref={props.buttonRef}
      >
        {children}
        <span part="value-count" class="value-count">
          {props.i18n.t('between-parentheses', {
            text: count,
          })}
        </span>
      </Button>
    </li>
  );
};
