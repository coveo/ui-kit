import {SearchPageState} from '../../../state';
import {getQParam} from '../search-request';
import {FacetRequest} from '../../../features/facets/facet-set/facet-set-interfaces';
import {Context} from '../../../features/context/context-slice';

export interface SearchRequest {
  q: string;
  numberOfResults: number;
  sortCriteria: string;
  firstResult: number;
  facets: FacetRequest[];
  context: Context;
}

/** The search request parameters. For a full description, refer to {@link https://docs.coveo.com/en/13/cloud-v2-api-reference/search-api#operation/searchUsingPost}*/
export const searchRequestParams = (state: SearchPageState): SearchRequest => {
  return {
    ...getQParam(state),
    numberOfResults: state.pagination.numberOfResults,
    sortCriteria: state.sortCriteria,
    firstResult: state.pagination.firstResult,
    facets: getFacets(state),
    context: state.context.contextValues,
  };
};

function getFacets(state: SearchPageState) {
  return getFacetRequests(state);
}

function getFacetRequests(state: SearchPageState): FacetRequest[] {
  const requests = state.facetSet;
  return Object.keys(requests).map((id) => requests[id]);
}
