import {getQParam} from '../search-api-params';
import {Context} from '../../../features/context/context-slice';
import {AnyFacetRequest} from '../../../features/facets/generic/interfaces/generic-facet-request';
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
    ...getFacetRequests(state.facetSet),
    ...getFacetRequests(state.numericFacetSet),
    ...getFacetRequests(state.dateFacetSet),
    ...getFacetRequests(state.categoryFacetSet),
  ];
}

function getFacetRequests(requests: Record<string, AnyFacetRequest>) {
  return Object.keys(requests).map((id) => requests[id]);
}
