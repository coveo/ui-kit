import {h} from '@stencil/core';
import {randomID} from '../../../utils/utils';

export type FacetValueProps = {
  facetValueSelected: VoidFunction;
  label: string;
  numberOfResults: number;
  isSelected: boolean;
  ariaLabel: string;
};

export const FacetValue = (props: FacetValueProps) => {
  const id = randomID('input');
  return (
    <li
      part="facet-value"
      class="flex flex-row items-center py-2 lg:py-1 cursor-pointer text-lg lg:text-base"
      aria-label={props.ariaLabel}
    >
      <input
        type="checkbox"
        checked={props.isSelected}
        class="facet-value-checkbox w-5 h-5"
        id={id}
        name={id}
        onClick={() => props.facetValueSelected()}
      />
      <label
        htmlFor={id}
        class="ml-3 text-on-background cursor-pointer flex-shrink whitespace-nowrap overflow-ellipsis overflow-hidden"
        title={props.label}
      >
        {props.label}
      </label>
      <span class="ml-auto my-auto self-end text-on-background-variant">
        {props.numberOfResults}
      </span>
    </li>
  );
};
