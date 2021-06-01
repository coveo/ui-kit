import {FunctionalComponent, h} from '@stencil/core';

interface FacetShowMoreProps {
  label: string;
}

// TODO: add interactivity, style & part
export const FacetShowMore: FunctionalComponent<FacetShowMoreProps> = (
  props
) => <div>+ {props.label}</div>;
