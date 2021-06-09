import {FacetValueState} from '@coveo/headless';
import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import {randomID} from '../../../utils/utils';

interface FacetValueCheckboxProps {
  i18n: i18n;
  value: string;
  numberOfResults: number;
  state: FacetValueState;
  onClick(): void;
}

export const FacetValueCheckbox: FunctionalComponent<FacetValueCheckboxProps> = (
  props
) => {
  const id = randomID('facet-value-');
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
        id={id}
        role="checkbox"
        onClick={() => props.onClick()}
        aria-checked={isSelected.toString()}
        class={`checkbox flex justify-center rounded border border-neutral-dark focus:outline-none focus:border-primary-light ${
          isSelected ? 'checked bg-primary border-none' : ''
        }`}
        aria-label={ariaLabel}
      ></button>
      <label
        htmlFor={id}
        class="w-full flex pl-2 py-2.5 text-on-background cursor-pointer ellipsed"
      >
        <span
          title={displayValue}
          part="value-label"
          class="value-label ellipsed"
        >
          {displayValue}
        </span>
        <span
          part="value-count"
          class="ml-1.5 text-neutral-dark with-parentheses"
        >
          {count}
        </span>
      </label>
    </li>
  );
};
