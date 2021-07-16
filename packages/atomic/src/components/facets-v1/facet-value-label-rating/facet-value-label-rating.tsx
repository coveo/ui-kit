import {FunctionalComponent, h} from '@stencil/core';
import {FacetValueLabelRatingProps} from '../facet-common';

export const FacetValueLabelRating: FunctionalComponent<FacetValueLabelRatingProps> = (
  props
) => {
  return (
    <div class="flex items-center gap-0.5 pt-0.5 pb-0.5" part="value-label">
      {props.icons}
    </div>
  );
};
