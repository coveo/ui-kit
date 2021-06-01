import {FunctionalComponent, h} from '@stencil/core';

interface FacetShowLessProps {
  label: string;
}

// TODO: add interactivity, style & part
export const FacetShowLess: FunctionalComponent<FacetShowLessProps> = (
  props
) => <div>- {props.label}</div>;
