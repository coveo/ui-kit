import {FunctionalComponent, h} from '@stencil/core';
import {FacetValueProps, FacetValue} from '../facet-value/facet-value';

export const FacetSearchValue: FunctionalComponent<
  Omit<FacetValueProps, 'facetState' | 'setRef'>
> = (props) => {
  return <FacetValue {...props} facetState="idle" />;
};
