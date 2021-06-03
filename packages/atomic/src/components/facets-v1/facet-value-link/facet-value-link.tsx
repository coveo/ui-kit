import {FunctionalComponent, h} from '@stencil/core';

interface FacetValueLinkProps {
  value: string;
}

// TODO: add interactivity, style & part
export const FacetValueLink: FunctionalComponent<FacetValueLinkProps> = (
  props
) => (
  <div>
    <a href="#">{props.value}</a>
  </div>
);
