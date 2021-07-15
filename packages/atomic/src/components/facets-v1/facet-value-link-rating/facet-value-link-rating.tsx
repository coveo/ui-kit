import {FunctionalComponent, h} from '@stencil/core';
import {FacetValueProps} from '../facet-common';

export const FacetValueLinkRating: FunctionalComponent<FacetValueProps> = (
  props,
  children
) => {
  const count = props.numberOfResults.toLocaleString(props.i18n.language);
  const ariaLabel = props.i18n.t('facetValue', {
    value: props.displayValue,
    count: props.numberOfResults,
  });

  return (
    <li key={props.displayValue}>
      <button
        part="value-link"
        onClick={() => props.onClick()}
        class="value-link w-full flex items-center py-2.5 text-on-background ellipsed focus:outline-none"
        aria-pressed={props.isSelected.toString()}
        aria-label={ariaLabel}
      >
        <div class="flex items-center gap-0.5 pt-0.5 pb-0.5" part="value-label">
          {children}
        </div>
        <span
          part="value-count"
          class="ml-1.5 text-neutral-dark with-parentheses"
        >
          {count}
        </span>
      </button>
    </li>
  );
};
