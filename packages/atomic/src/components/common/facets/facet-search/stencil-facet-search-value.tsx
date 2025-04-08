import {FunctionalComponent, h} from '@stencil/core';
import {FacetValueProps, FacetValue} from '../facet-value/stencil-facet-value';

/**
 * @deprecated Should only be used for Stencil components; for Lit components, use the facet-search-value.ts file instead
 */
export const FacetSearchValue: FunctionalComponent<
  Omit<FacetValueProps, 'facetState' | 'setRef'>
> = (props) => {
  return <FacetValue {...props} facetState="idle" />;
};
