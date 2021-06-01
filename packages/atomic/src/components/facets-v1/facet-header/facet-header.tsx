import {FunctionalComponent, h} from '@stencil/core';

interface FacetHeaderProps {
  label: string;
}

// TODO: add interactivity, style & part
export const FacetHeader: FunctionalComponent<FacetHeaderProps> = (props) => (
  <div>{props.label}</div>
);
