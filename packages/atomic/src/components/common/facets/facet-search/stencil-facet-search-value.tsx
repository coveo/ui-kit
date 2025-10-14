import {FunctionalComponent, h} from '@stencil/core';
import {FacetValueProps, FacetValue} from '../facet-value/stencil-facet-value';

/**
 * @deprecated should only be used for Stencil components.
 */
export const FacetSearchValue: FunctionalComponent<
  Omit<FacetValueProps, 'facetState' | 'setRef'>
> = (props) => {
  return <FacetValue {...props} facetState="idle" />;
};
