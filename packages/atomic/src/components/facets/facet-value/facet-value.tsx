import {h} from '@stencil/core';
import {randomID} from '../../../utils/utils';

export type FacetValueProps = {
  facetValueSelected: VoidFunction;
  label: string;
  numberOfResults: number;
  isSelected: boolean;
};

export const FacetValue = (props: FacetValueProps) => {
  const id = randomID('input');
  return (
    <li
      role="option"
      class="flex flex-row items-center py-2 lg:py-1 cursor-pointer text-lg lg:text-base"
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
        class="ml-3 flex flex-row text-on-background flex-grow cursor-pointer"
      >
        <span class="my-auto">{props.label}</span>
        <span class="ml-auto my-auto self-end text-on-background-variant">
          {props.numberOfResults}
        </span>
      </label>
    </li>
  );
};
