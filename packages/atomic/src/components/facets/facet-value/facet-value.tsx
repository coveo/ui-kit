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
      class="flex flex-row items-center mt-2 cursor-pointer text-base"
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
        {props.label}
        <span class="ml-auto self-end text-on-background-variant">
          {props.numberOfResults}
        </span>
      </label>
    </li>
  );
};

