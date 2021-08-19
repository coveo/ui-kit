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
  });

  return (
    <li key={props.displayValue}>
      <Button
        style="text-neutral"
        part="value-link"
        onClick={() => props.onClick()}
        class="w-full flex items-center px-2 py-2.5 text-left truncate no-outline"
        ariaPressed={props.isSelected.toString()}
        ariaLabel={ariaLabel}
      >
        {children}
        <span part="value-count" class="value-count">
          {count}
        </span>
      </Button>
    </li>
  );
};
