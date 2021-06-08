import {h, FunctionalComponent} from '@stencil/core';
import {randomID} from '../../../utils/utils';

export type FacetValueProps = {
  facetValueSelected: VoidFunction;
  label: string;
  numberOfResults: string;
  isSelected: boolean;
  ariaLabel: string;
};

export const FacetValue: FunctionalComponent<FacetValueProps> = (props) => {
  const id = randomID('facet-value-');
  return (
    <li part="value" class="flex flex-row items-center">
      <button
        id={id}
        role="checkbox"
        onClick={() => props.facetValueSelected()}
        aria-checked={props.isSelected.toString()}
        class={`checkbox ${props.isSelected ? 'checked' : ''}`}
        aria-label={props.ariaLabel}
      ></button>
      <label
        htmlFor={id}
        class="w-full flex pl-3 text-on-background cursor-pointer ellipsed text-lg lg:text-base py-1.5"
        title={props.label}
      >
        <span part="value-label" class="ellipsed">
          {props.label}
        </span>
        <span part="value-count" class="value-count">
          {props.numberOfResults}
        </span>
      </label>
    </li>
  );
};
