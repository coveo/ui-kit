import {CommerceFacetResponse} from '../../../api/commerce/product-listings/v2/facet';

export interface CommerceFacetsState {
  facets: CommerceFacetResponse[];
}

export const getCommerceFacetsInitialState = (): CommerceFacetsState => ({
  facets: [],
});
