import type {HistoryElement} from '../../api/analytics/coveo.analytics/history-store.js';
import HistoryStore from '../../api/analytics/coveo.analytics/history-store.js';
import type {GeneratedAnswerStreamRequest} from '../../api/generated-answer/generated-answer-request.js';
import type {StreamAnswerAPIState} from '../../api/knowledge/stream-answer-api-state.js';
import {getOrganizationEndpoint} from '../../api/platform-client.js';
import type {BaseParam} from '../../api/platform-service-params.js';
import type {SearchRequest} from '../../api/search/search/search-request.js';
import type {
  AuthenticationParam,
  AutomaticFacetsParams,
} from '../../api/search/search-api-params.js';
import type {CaseContextParam} from '../../api/service/insight/query/query-request.js';
import type {NavigatorContext} from '../../app/navigator-context-provider.js';
import {selectAdvancedSearchQueries} from '../../features/advanced-search-queries/advanced-search-query-selectors.js';
import {fromAnalyticsStateToAnalyticsParams} from '../../features/configuration/analytics-params.js';
import {selectContext} from '../../features/context/context-selector.js';
import {selectFieldsToIncludeInCitation} from '../../features/generated-answer/generated-answer-selectors.js';
import {selectPipeline} from '../../features/pipeline/select-pipeline.js';
import {
  selectEnableQuerySyntax,
  selectQuery,
} from '../../features/query/query-selectors.js';
import {
  initialSearchMappings,
  mapFacetRequest,
} from '../../features/search/search-mappings.js';
import {
  buildConstantQuery,
  getNumberOfResultsWithinIndexLimit,
} from '../../features/search/search-request.js';
import {selectSearchActionCause} from '../../features/search/search-selectors.js';
import {selectSearchHub} from '../../features/search-hub/search-hub-selectors.js';
import {selectActiveTab} from '../../features/tab-set/tab-set-selectors.js';
import type {
  ConfigurationSection,
  GeneratedAnswerSection,
  SearchSection,
} from '../../state/state-sections.js';
import {getFacets} from '../../utils/facet-utils.js';
import {
  selectLocale,
  selectTimezone,
} from '../configuration/configuration-selectors.js';
import {selectDictionaryFieldContext} from '../dictionary-field-context/dictionary-field-context-selectors.js';
import {selectExcerptLength} from '../excerpt-length/excerpt-length-selectors.js';
import {selectFacetOptions} from '../facet-options/facet-options-selectors.js';
import type {AnyFacetRequest} from '../facets/generic/interfaces/generic-facet-request.js';
import {selectFoldingQueryParams} from '../folding/folding-selectors.js';
import {selectSortCriteria} from '../sort-criteria/sort-criteria-selectors.js';

type StateNeededByGeneratedAnswerStream = ConfigurationSection &
  SearchSection &
  GeneratedAnswerSection;

export interface AnswerApiQueryParams
  extends Omit<
      SearchRequest,
      keyof (BaseParam & AuthenticationParam & AutomaticFacetsParams)
    >,
    CaseContextParam {}

export const buildStreamingRequest = async (
  state: StateNeededByGeneratedAnswerStream
): Promise<GeneratedAnswerStreamRequest> => ({
  accessToken: state.configuration.accessToken,
  organizationId: state.configuration.organizationId,
  url: getOrganizationEndpoint(
    state.configuration.organizationId,
    state.configuration.environment
  ),
  streamId: state.search.extendedResults?.generativeQuestionAnsweringId,
});

export const constructAnswerAPIQueryParams = (
  state: StreamAnswerAPIState,
  navigatorContext: NavigatorContext
): AnswerApiQueryParams => {
  const q = selectQuery(state)?.q;

  const {aq, cq, dq, lq} = buildAdvancedSearchQueryParams(state);

  const context = selectContext(state);

  const analyticsParams = fromAnalyticsStateToAnalyticsParams(
    state.configuration.analytics,
    navigatorContext,
    {actionCause: selectSearchActionCause(state)}
  );

  const searchHub = selectSearchHub(state);
  const pipeline = selectPipeline(state);
  const citationsFieldToInclude = selectFieldsToIncludeInCitation(state) ?? [];
  const facetParams = getGeneratedFacetParams(state);
  const tab = selectActiveTab(state.tabSet) || 'default';
  const locale = selectLocale(state);
  const timezone = selectTimezone(state);
  const referrer = navigatorContext.referrer || '';
  const facetOptions = selectFacetOptions(state);
  const sortCriteria = selectSortCriteria(state);
  const actionsHistory = getActionsHistory(state);
  const excerptLength = selectExcerptLength(state);
  const foldingParams = selectFoldingQueryParams(state);
  const dictionaryFieldContext = selectDictionaryFieldContext(state);

  return {
    q,
    ...(aq && {aq}),
    ...(cq && {cq}),
    ...(dq && {dq}),
    ...(lq && {lq}),
    ...(state.query && {enableQuerySyntax: selectEnableQuerySyntax(state)}),
    ...(context?.contextValues && {
      context: context.contextValues,
    }),
    pipelineRuleParameters: {
      mlGenerativeQuestionAnswering: {
        responseFormat: state.generatedAnswer.responseFormat,
        citationsFieldToInclude,
      },
    },
    ...(searchHub?.length && {searchHub}),
    ...(pipeline?.length && {pipeline}),
    ...(facetParams.length && {facets: facetParams}),
    ...(state.fields && {fieldsToInclude: state.fields.fieldsToInclude}),
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
    ...(state.pagination && {
      numberOfResults: getNumberOfResultsWithinIndexLimit(state),
      firstResult: state.pagination.firstResult,
    }),
    tab,
    locale,
    timezone,
    ...(state.debug !== undefined && {debug: state.debug}),
    referrer,
    ...actionsHistory,
    ...(foldingParams ?? {}),
    ...(excerptLength && {excerptLength}),
    ...(dictionaryFieldContext && {
      dictionaryFieldContext,
    }),
    sortCriteria,
    ...(facetOptions && {facetOptions}),
    ...analyticsParams,
    ...(state.insightCaseContext?.caseContext && {
      caseContext: state.insightCaseContext?.caseContext,
    }),
  };
};

const getGeneratedFacetParams = (
  state: StreamAnswerAPIState
): AnyFacetRequest[] =>
  getFacets(state)
    ?.map((facetRequest) =>
      mapFacetRequest(facetRequest, initialSearchMappings())
    )
    .sort((a, b) =>
      a.facetId > b.facetId ? 1 : b.facetId > a.facetId ? -1 : 0
    );

const getActionsHistory = (
  state: StreamAnswerAPIState
): {actionsHistory: HistoryElement[]} => ({
  actionsHistory: state.configuration.analytics.enabled
    ? HistoryStore.getInstance().getHistory()
    : [],
});

const buildAdvancedSearchQueryParams = (state: StreamAnswerAPIState) => {
  const advancedSearchQueryParams = selectAdvancedSearchQueries(state);
  const mergedCq = buildConstantQuery(state);

  return {
    ...advancedSearchQueryParams,
    ...(mergedCq && {cq: mergedCq}),
  };
};
