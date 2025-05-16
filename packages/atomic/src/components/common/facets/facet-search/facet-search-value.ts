import {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {html} from 'lit';
import {FacetValueProps, renderFacetValue} from '../facet-value/facet-value';

export const renderFacetSearchValue: FunctionalComponent<
  Omit<FacetValueProps, 'facetState' | 'setRef'>
> = ({props}) => {
  return html`${renderFacetValue({props: {...props, facetState: 'idle'}})}`;
};
