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
      <input
        type="checkbox"
        checked={props.isSelected}
        class="w-5 h-5 flex-none rounded cursor-pointer"
        id={id}
        name={id}
        onClick={() => props.facetValueSelected()}
        aria-label={props.ariaLabel}
      />
      <label
        htmlFor={id}
        class="w-full flex pl-3 text-on-background cursor-pointer ellipsed lg:text-sm py-1.5"
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
