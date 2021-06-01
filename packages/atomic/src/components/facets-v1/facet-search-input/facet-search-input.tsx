import {FunctionalComponent, h} from '@stencil/core';

interface FacetSearchInputProps {
  query: string;
}

// TODO: add interactivity, style & part
export const FacetSearchInput: FunctionalComponent<FacetSearchInputProps> = (
  props
) => (
  <div>
    <input type="text" value={props.query} />
  </div>
);
