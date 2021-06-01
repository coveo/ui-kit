import {FunctionalComponent, h} from '@stencil/core';

interface FacetValueCheckboxProps {
  value: string;
}

// TODO: add interactivity, style & part
export const FacetValueCheckbox: FunctionalComponent<FacetValueCheckboxProps> = (
  props
) => (
  <div>
    <input type="checkbox" /> {props.value}
  </div>
);
