import {FunctionalComponent, h} from '@stencil/core';
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
      <button
        part="value-link"
        onClick={() => props.onClick()}
        class="value-link w-full flex items-center py-2.5 text-left text-on-background truncate focus:outline-none group focus:bg-neutral-light hover:bg-neutral-light"
        aria-pressed={props.isSelected.toString()}
        aria-label={ariaLabel}
      >
        {children}
        <span part="value-count" class="value-count">
          {count}
        </span>
      </button>
    </li>
  );
};
