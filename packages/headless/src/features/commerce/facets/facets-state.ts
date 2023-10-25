import {AnyFacetResponse} from '../../facets/generic/interfaces/generic-facet-response';

export interface CommerceFacetsState {
  facets: AnyFacetResponse[];
}

export const getCommerceFacetsInitialState = (): CommerceFacetsState => ({
  facets: [],
});
