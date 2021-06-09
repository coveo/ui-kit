import {FacetValueState} from '@coveo/headless';
import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';

interface FacetValueLinkProps {
  i18n: i18n;
  value: string;
  numberOfResults: number;
  state: FacetValueState;
  onClick(): void;
}

export const FacetValueLink: FunctionalComponent<FacetValueLinkProps> = (
  props
) => {
  const isSelected = props.state === 'selected';
  const displayValue = props.i18n.t(props.value);
  const count = props.numberOfResults.toLocaleString(props.i18n.language);
  const ariaLabel = props.i18n.t('facetValue', {
    value: displayValue,
    count: props.numberOfResults,
  });
  return (
    <li part="value" class="flex flex-row items-center">
      <button
        onClick={() => props.onClick()}
        class="link-value w-full flex py-2.5 text-on-background ellipsed focus:outline-none"
        aria-pressed={isSelected.toString()}
        aria-label={ariaLabel}
      >
        <span
          title={displayValue}
          part="value-label"
          class={`value-label ellipsed ${isSelected ? 'font-bold' : ''}`}
        >
          {displayValue}
        </span>
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
