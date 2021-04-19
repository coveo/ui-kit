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
    <li
      part="facet-value"
      class="flex flex-row items-center py-2 lg:py-1 cursor-pointer text-lg lg:text-base"
      aria-label={props.ariaLabel}
    >
      <input
        type="checkbox"
        checked={props.isSelected}
        class="w-5 h-5 flex-none"
        id={id}
        name={id}
        onClick={() => props.facetValueSelected()}
      />
      <label
        htmlFor={id}
        class="flex pl-3 text-on-background cursor-pointer ellipsed"
        title={props.label}
      >
        <span class="ellipsed">{props.label}</span>
        <span class="text-on-background-variant ml-1.5">
          ({props.numberOfResults})
        </span>
      </label>
    </li>
  );
};
