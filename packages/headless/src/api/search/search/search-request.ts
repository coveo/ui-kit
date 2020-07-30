import {SearchPageState} from '../../../state';
import {getQParam} from '../search-api-params';
import {FacetRequest} from '../../../features/facets/facet-set/interfaces/request';
import {Context} from '../../../features/context/context-slice';
import {RangeFacetRequest} from '../../../features/facets/range-facets/generic/interfaces/range-facet';

export interface SearchRequest {
  q: string;
  numberOfResults: number;
  sortCriteria: string;
  firstResult: number;
  facets: (FacetRequest | RangeFacetRequest)[];
  context: Context;
  enableDidYouMean: boolean;
  fieldsToInclude: string[];
  pipeline: string;
  searchHub: string;
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
    enableDidYouMean: state.didYouMean.enableDidYouMean,
    fieldsToInclude: state.fields.fieldsToInclude,
    pipeline: state.pipeline,
    searchHub: state.searchHub,
  };
};

function getFacets(state: SearchPageState) {
  return [
    ...getFacetRequests(state.facetSet),
    ...getFacetRequests(state.numericFacetSet),
    ...getFacetRequests(state.dateFacetSet),
  ];
}

function getFacetRequests(
  requests: Record<string, FacetRequest | RangeFacetRequest>
) {
  return Object.keys(requests).map((id) => requests[id]);
}
