import {FunctionalComponent, h} from '@stencil/core';

interface FacetValueBoxProps {
  value: string;
}

// TODO: add interactivity, style & part
export const FacetValueBox: FunctionalComponent<FacetValueBoxProps> = (
  props
) => <div class="border border-primary">{props.value}</div>;
