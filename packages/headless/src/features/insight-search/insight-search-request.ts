import type {EventDescription} from 'coveo.analytics';
import {getOrganizationEndpoint} from '../../api/platform-client.js';
import type {InsightQueryRequest} from '../../api/service/insight/query/query-request.js';
import type {InsightAppState} from '../../state/insight-app-state.js';
import type {
  ConfigurationSection,
  InsightConfigurationSection,
} from '../../state/state-sections.js';
import {fromAnalyticsStateToAnalyticsParams} from '../configuration/legacy-analytics-params.js';
import {getFacetRequests} from '../facets/generic/interfaces/generic-facet-request.js';
import type {CollectionId} from '../folding/folding-state.js';
import {maximumNumberOfResultsFromIndex} from '../pagination/pagination-constants.js';
import {
  type MappedSearchRequest,
  mapSearchRequest,
} from '../search/search-mappings.js';

type StateNeededBySearchRequest = ConfigurationSection &
  InsightConfigurationSection &
  Partial<InsightAppState>;

export const buildInsightBaseRequest = async (
  state: StateNeededBySearchRequest,
  eventDescription?: EventDescription
): Promise<MappedSearchRequest<InsightQueryRequest>> => {
  const cq = buildConstantQuery(state);
  const facets = getAllFacets(state);
  return mapSearchRequest<InsightQueryRequest>({
    accessToken: state.configuration.accessToken,
    organizationId: state.configuration.organizationId,
    url:
      state.configuration.search.apiBaseUrl ??
      getOrganizationEndpoint(
        state.configuration.organizationId,
        state.configuration.environment
      ),
    locale: state.configuration.search.locale,
    insightId: state.insightConfiguration.insightId,
    ...(state.configuration.analytics.enabled &&
      (await fromAnalyticsStateToAnalyticsParams(
        state.configuration.analytics,
        eventDescription
      ))),
    q: state.query?.q,
    ...(facets.length && {facets}),
    caseContext: state.insightCaseContext?.caseContext,
    ...(cq && {cq}),
    ...(state.fields &&
      !state.fields.fetchAllFields && {
        fieldsToInclude: state.fields.fieldsToInclude,
      }),
    ...(state.didYouMean && {
      queryCorrection: {
        enabled:
          state.didYouMean.enableDidYouMean &&
          state.didYouMean.queryCorrectionMode === 'next',
        options: {
          automaticallyCorrect: state.didYouMean.automaticallyCorrectQuery
            ? ('whenNoResults' as const)
            : ('never' as const),
        },
      },
      enableDidYouMean:
        state.didYouMean.enableDidYouMean &&
        state.didYouMean.queryCorrectionMode === 'legacy',
    }),
    ...(state.sortCriteria && {
      sortCriteria: state.sortCriteria,
    }),
    tab: state.configuration.analytics.originLevel2,
    ...(state.folding && {
      filterField: state.folding.fields.collection,
      childField: state.folding.fields.parent,
      parentField: state.folding.fields.child,
      filterFieldRange: state.folding.filterFieldRange,
    }),
    ...(state.context && {context: state.context.contextValues}),
    ...(state.generatedAnswer && {
      pipelineRuleParameters: {
        mlGenerativeQuestionAnswering: {
          responseFormat: state.generatedAnswer.responseFormat,
          citationsFieldToInclude:
            state.generatedAnswer.fieldsToIncludeInCitations,
        },
      },
    }),
  });
};

export const buildInsightSearchRequest = async (
  state: StateNeededBySearchRequest,
  eventDescription?: EventDescription
): Promise<MappedSearchRequest<InsightQueryRequest>> => {
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

  const baseRequest = await buildInsightBaseRequest(state, eventDescription);
  return {
    ...baseRequest,
    request: {
      ...baseRequest.request,
      ...(state.pagination && {
        firstResult: state.pagination.firstResult,
        numberOfResults: getNumberOfResultsWithinIndexLimit(),
      }),
    },
  };
};

export const buildInsightLoadCollectionRequest = async (
  state: StateNeededBySearchRequest,
  collectionId: CollectionId
): Promise<MappedSearchRequest<InsightQueryRequest>> => {
  const baseRequest = await buildInsightBaseRequest(state);
  return {
    ...baseRequest,
    request: {
      ...baseRequest.request,
      filterFieldRange: 100,
      cq: `@${state?.folding?.fields.collection}="${collectionId}"`,
    },
  };
};

export const buildInsightFetchMoreResultsRequest = async (
  state: StateNeededBySearchRequest,
  eventDescription?: EventDescription
): Promise<MappedSearchRequest<InsightQueryRequest>> => {
  const mappedRequest = await buildInsightSearchRequest(
    state,
    eventDescription
  );
  mappedRequest.request = {
    ...mappedRequest.request,
    firstResult:
      (state.pagination?.firstResult ?? 0) +
      (state.pagination?.numberOfResults ?? 0),
  };
  return mappedRequest;
};

export const buildInsightFetchFacetValuesRequest = async (
  state: StateNeededBySearchRequest,
  eventDescription?: EventDescription
): Promise<MappedSearchRequest<InsightQueryRequest>> => {
  const mappedRequest = await buildInsightSearchRequest(
    state,
    eventDescription
  );
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
