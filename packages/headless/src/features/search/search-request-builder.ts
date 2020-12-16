import {getVisitorID} from '../../api/analytics/analytics';
import {SearchRequest} from '../../api/search/search/search-request';
import {CategoryFacetSetState} from '../facets/category-facet-set/category-facet-set-state';
import {CategoryFacetRequest} from '../facets/category-facet-set/interfaces/request';
import {AnyFacetRequest} from '../facets/generic/interfaces/generic-facet-request';
import {StateNeededByExecuteSearch} from './search-actions';

export const buildSearchRequest = (
  state: StateNeededByExecuteSearch
): SearchRequest => {
  return {
    accessToken: state.configuration.accessToken,
    organizationId: state.configuration.organizationId,
    url: state.configuration.search.apiBaseUrl,
    debug: state.debug,
    ...(state.configuration.analytics.enabled && {
      visitorId: getVisitorID(),
    }),
    ...(state.advancedSearchQueries && {
      aq: state.advancedSearchQueries.aq,
      cq: state.advancedSearchQueries.cq,
    }),
    ...(state.context && {
      context: state.context.contextValues,
    }),
    ...(state.didYouMean && {
      enableDidYouMean: state.didYouMean.enableDidYouMean,
    }),
    ...(state.facetSet && {
      facets: getFacets(state),
    }),
    ...(state.fields && {
      fieldsToInclude: state.fields.fieldsToInclude,
    }),
    ...(state.pagination && {
      numberOfResults: state.pagination.numberOfResults,
      firstResult: state.pagination.firstResult,
    }),
    ...(state.pipeline && {
      pipeline: state.pipeline,
    }),
    ...(state.query && {
      q: state.query.q,
      enableQuerySyntax: state.query.enableQuerySyntax,
    }),
    ...(state.searchHub && {
      searchHub: state.searchHub,
    }),
    ...(state.sortCriteria && {
      sortCriteria: state.sortCriteria,
    }),
    ...(state.facetOptions && {
      facetOptions: state.facetOptions,
    }),
  };
};

function getFacets(state: StateNeededByExecuteSearch) {
  return [
    ...getFacetsInSameOrderAsResponse(state),
    ...getFacetsNotInResponse(state),
  ];
}

function getFacetsInSameOrderAsResponse(state: StateNeededByExecuteSearch) {
  const requests: AnyFacetRequest[] = [];
  if (!state.search) {
    return requests;
  }
  const responseFacets = state.search.response.facets;

  responseFacets.forEach((f) => {
    const request = findFacetRequest(state, f.facetId);
    request && requests.push(request);
  });

  return requests;
}

function findFacetRequest(state: StateNeededByExecuteSearch, facetId: string) {
  const sets = [
    state.facetSet,
    state.numericFacetSet,
    state.dateFacetSet,
    getCategoryFacetRequestMap(state.categoryFacetSet),
  ];

  const targetSet = sets.find((set) => set && set[facetId]);
  return targetSet ? targetSet[facetId] : undefined;
}

function getCategoryFacetRequestMap(
  state: CategoryFacetSetState | undefined
): Record<string, CategoryFacetRequest> {
  return Object.entries(state || {})
    .map(([facetId, slice]) => ({[facetId]: slice!.request}))
    .reduce((all, current) => ({...all, ...current}), {});
}

function getFacetsNotInResponse(state: StateNeededByExecuteSearch) {
  const excludedFacetIds = new Set<string>();
  const responseFacets = state.search?.response.facets;
  responseFacets?.forEach((f) => excludedFacetIds.add(f.facetId));

  return getAllFacets(state).filter((f) => !excludedFacetIds.has(f.facetId));
}

function getAllFacets(state: StateNeededByExecuteSearch) {
  return [
    ...getFacetRequests(state.facetSet),
    ...getFacetRequests(state.numericFacetSet),
    ...getFacetRequests(state.dateFacetSet),
    ...getCategoryFacetRequests(state.categoryFacetSet),
  ];
}

function getCategoryFacetRequests(state: CategoryFacetSetState | undefined) {
  return Object.values(state || {}).map((slice) => {
    const request = slice!.request;
    const numberOfValues = request.currentValues.length
      ? 1
      : request.numberOfValues;
    return {...request, numberOfValues};
  });
}

function getFacetRequests<T extends AnyFacetRequest>(
  requests: Record<string, T> = {}
) {
  return Object.keys(requests).map((id) => requests[id]);
}
