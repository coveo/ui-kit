import {InsightQueryRequest} from '../../api/service/insight/query/query-request';
import {InsightAppState} from '../../state/insight-app-state';
import {
  ConfigurationSection,
  InsightConfigurationSection,
} from '../../state/state-sections';
import {getFacetRequests} from '../facets/generic/interfaces/generic-facet-request';
import {maximumNumberOfResultsFromIndex} from '../pagination/pagination-constants';
import {MappedSearchRequest, mapSearchRequest} from '../search/search-mappings';

type StateNeededBySearchRequest = ConfigurationSection &
  InsightConfigurationSection &
  Partial<InsightAppState>;

export const buildInsightSearchRequest = (
  state: StateNeededBySearchRequest
): MappedSearchRequest<InsightQueryRequest> => {
  const cq = buildConstantQuery(state);
  const facets = getAllFacets(state);
  const getNumberOfResultsWithinIndexLimit = () => {
    if (!state.pagination) {
      return undefined;
    }

    const isOverIndexLimit =
      state.pagination.firstResult + state.pagination.numberOfResults >
      maximumNumberOfResultsFromIndex;

    if (isOverIndexLimit) {
      return maximumNumberOfResultsFromIndex - state.pagination.firstResult;
    }
    return state.pagination.numberOfResults;
  };
  return mapSearchRequest<InsightQueryRequest>({
    accessToken: state.configuration.accessToken,
    organizationId: state.configuration.organizationId,
    url: state.configuration.platformUrl,
    insightId: state.insightConfiguration.insightId,
    q: state.query?.q,
    ...(facets.length && {facets}),
    caseContext: state.insightCaseContext?.caseContext,
    ...(state.pagination && {
      firstResult: state.pagination.firstResult,
      numberOfResults: getNumberOfResultsWithinIndexLimit(),
    }),
    ...(cq && {cq}),
    ...(state.fields &&
      !state.fields.fetchAllFields && {
        fieldsToInclude: state.fields.fieldsToInclude,
      }),
    ...(state.didYouMean && {
      enableDidYouMean: state.didYouMean.enableDidYouMean,
    }),
    ...(state.sortCriteria && {
      sortCriteria: state.sortCriteria,
    }),
  });
};

export const buildInsightFetchMoreResultsRequest = async (
  state: StateNeededBySearchRequest
): Promise<MappedSearchRequest<InsightQueryRequest>> => {
  const mappedRequest = await buildInsightSearchRequest(state);
  mappedRequest.request = {
    ...mappedRequest.request,
    firstResult:
      (state.pagination?.firstResult ?? 0) +
      (state.pagination?.numberOfResults ?? 0),
  };
  return mappedRequest;
};

export const buildInsightFetchFacetValuesRequest = async (
  state: StateNeededBySearchRequest
): Promise<MappedSearchRequest<InsightQueryRequest>> => {
  const mappedRequest = await buildInsightSearchRequest(state);
  mappedRequest.request = {
    ...mappedRequest.request,
    numberOfResults: 0,
  };
  return mappedRequest;
};

function getAllFacets(state: StateNeededBySearchRequest) {
  return getFacetRequests({
    ...state.facetSet,
    ...state.numericFacetSet,
    ...state.dateFacetSet,
    ...state.categoryFacetSet,
  });
}

function buildConstantQuery(state: StateNeededBySearchRequest) {
  const activeTab = Object.values(state.tabSet || {}).find(
    (tab) => tab.isActive
  );
  const tabExpression = activeTab?.expression.trim() || '';

  return tabExpression;
}
