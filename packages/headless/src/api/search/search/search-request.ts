import {getQParam} from '../search-api-params';
import {Context} from '../../../features/context/context-slice';
import {AnyFacetRequest} from '../../../features/facets/generic/interfaces/generic-facet-request';
import {FacetOptions} from '../../../features/facet-options/facet-options';
import {configureAnalytics} from '../../analytics/analytics';
import {SearchAppState} from '../../../state/search-app-state';

export interface SearchRequest {
  q: string;
  aq: string;
  cq: string;
  numberOfResults: number;
  sortCriteria: string;
  firstResult: number;
  facets: AnyFacetRequest[];
  facetOptions: FacetOptions;
  context: Context;
  enableDidYouMean: boolean;
  fieldsToInclude: string[];
  pipeline: string;
  searchHub: string;
  visitorId?: string;
}

/** The search request parameters. For a full description, refer to {@link https://docs.coveo.com/en/13/cloud-v2-api-reference/search-api#operation/searchUsingPost}*/
export const searchRequest = (state: SearchAppState): SearchRequest => {
  return {
    ...getQParam(state),
    aq: state.advancedSearchQueries.aq,
    cq: state.advancedSearchQueries.cq,
    numberOfResults: state.pagination.numberOfResults,
    sortCriteria: state.sortCriteria,
    firstResult: state.pagination.firstResult,
    facets: getFacets(state),
    facetOptions: state.facetOptions,
    context: state.context.contextValues,
    enableDidYouMean: state.didYouMean.enableDidYouMean,
    fieldsToInclude: state.fields.fieldsToInclude,
    pipeline: state.pipeline,
    searchHub: state.searchHub,
    ...(state.configuration.analytics.enabled && {
      visitorId: configureAnalytics(state).coveoAnalyticsClient
        .currentVisitorId,
    }),
  };
};

function getFacets(state: SearchAppState) {
  return [
    ...getFacetsInSameOrderAsResponse(state),
    ...getFacetsNotInResponse(state),
  ];
}

function getFacetsInSameOrderAsResponse(state: SearchAppState) {
  const responseFacets = state.search.response.facets;
  const requests: AnyFacetRequest[] = [];

  responseFacets.forEach((f) => {
    const request = findFacetRequest(state, f.facetId);
    request && requests.push(request);
  });

  return requests;
}

function findFacetRequest(state: SearchAppState, facetId: string) {
  const sets = [
    state.facetSet,
    state.numericFacetSet,
    state.dateFacetSet,
    state.categoryFacetSet,
  ];

  const targetSet = sets.find((set) => set[facetId]);
  return targetSet ? targetSet[facetId] : undefined;
}

function getFacetsNotInResponse(state: SearchAppState) {
  const excludedFacetIds = new Set<string>();
  const responseFacets = state.search.response.facets;
  responseFacets.forEach((f) => excludedFacetIds.add(f.facetId));

  return getAllFacets(state).filter((f) => !excludedFacetIds.has(f.facetId));
}

function getAllFacets(state: SearchAppState) {
  return [
    ...getFacetRequests(state.facetSet),
    ...getFacetRequests(state.numericFacetSet),
    ...getFacetRequests(state.dateFacetSet),
    ...getFacetRequests(state.categoryFacetSet),
  ];
}

function getFacetRequests(requests: Record<string, AnyFacetRequest>) {
  return Object.keys(requests).map((id) => requests[id]);
}
