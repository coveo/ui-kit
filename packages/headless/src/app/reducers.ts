import {configurationReducer} from '../features/configuration/configuration-slice';
import {specificFacetSearchSetReducer} from '../features/facets/facet-search-set/specific/specific-facet-search-set-slice';
import {facetSetReducer} from '../features/facets/facet-set/facet-set-slice';
import {paginationReducer} from '../features/pagination/pagination-slice';
import {searchReducer} from '../features/search/search-slice';

export const configuration = configurationReducer;
export const pagination = paginationReducer;
export const facetSet = facetSetReducer;
export const facetSearchSet = specificFacetSearchSetReducer;
export const search = searchReducer;
