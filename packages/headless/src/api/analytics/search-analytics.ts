import {
  CoveoSearchPageClient,
  SearchPageClientProvider,
  AnalyticsClientSendEventHook,
} from 'coveo.analytics';
import {SearchEventRequest} from 'coveo.analytics/dist/definitions/events.js';
import {Logger} from 'pino';
import {
  buildFacetStateMetadata,
  getStateNeededForFacetMetadata,
} from '../../features/facets/facet-set/facet-set-analytics-actions-utils.js';
import {FacetSortCriterion} from '../../features/facets/facet-set/interfaces/request.js';
import {DateFacetValue} from '../../features/facets/range-facets/date-facet-set/interfaces/response.js';
import {RangeFacetSortCriterion} from '../../features/facets/range-facets/generic/interfaces/request.js';
import {NumericFacetValue} from '../../features/facets/range-facets/numeric-facet-set/interfaces/response.js';
import {OmniboxSuggestionMetadata} from '../../features/query-suggest/query-suggest-analytics-actions.js';
import {getQueryInitialState} from '../../features/query/query-state.js';
import {getSearchInitialState} from '../../features/search/search-state.js';
import {getSortCriteriaInitialState} from '../../features/sort-criteria/sort-criteria-state.js';
import {StaticFilterValueMetadata} from '../../features/static-filter-set/static-filter-set-actions.js';
import {SearchAppState} from '../../state/search-app-state.js';
import {ConfigurationSection} from '../../state/state-sections.js';
import {getOrganizationEndpoint} from '../platform-client.js';
import {PreprocessRequest} from '../preprocess-request.js';
import {BaseAnalyticsProvider} from './base-analytics.js';
import {
  historyStore,
  wrapAnalyticsClientSendEventHook,
  wrapPreprocessRequest,
} from './coveo-analytics-utils.js';

export type StateNeededBySearchAnalyticsProvider = ConfigurationSection &
  Partial<Omit<SearchAppState, 'configuration'>>;

export class SearchAnalyticsProvider
  extends BaseAnalyticsProvider<StateNeededBySearchAnalyticsProvider>
  implements SearchPageClientProvider
{
  private static fallbackPipelineName = 'default';

  public getFacetState() {
    return buildFacetStateMetadata(
      getStateNeededForFacetMetadata(this.getState())
    );
  }

  public getPipeline() {
    return (
      this.state.pipeline ||
      this.state.search?.response.pipeline ||
      SearchAnalyticsProvider.fallbackPipelineName
    );
  }

  public getSearchEventRequestPayload(): Omit<
    SearchEventRequest,
    'actionCause' | 'searchQueryUid'
  > {
    return {
      queryText: this.queryText,
      responseTime: this.responseTime,
      results: this.resultURIs,
      numberOfResults: this.numberOfResults,
    };
  }

  public getSearchUID(): string {
    const newState = this.getState();
    return (
      newState.search?.searchResponseId ||
      newState.search?.response.searchUid ||
      getSearchInitialState().response.searchUid
    );
  }

  public getSplitTestRunName(): string | undefined {
    return this.state.search?.response.splitTestRun;
  }

  public getSplitTestRunVersion(): string | undefined {
    const hasSplitTestRun = !!this.getSplitTestRunName();
    const effectivePipelineWithSplitTestRun =
      this.state.search?.response.pipeline ||
      this.state.pipeline ||
      SearchAnalyticsProvider.fallbackPipelineName;

    return hasSplitTestRun ? effectivePipelineWithSplitTestRun : undefined;
  }

  public getBaseMetadata() {
    const state = this.getState();
    const baseObject = super.getBaseMetadata();

    const generativeQuestionAnsweringId =
      state.search?.response?.extendedResults?.generativeQuestionAnsweringId;

    if (generativeQuestionAnsweringId) {
      baseObject['generativeQuestionAnsweringId'] =
        generativeQuestionAnsweringId;
    }

    return baseObject;
  }

  public getFacetMetadata(facetId: string, facetValue: string) {
    const facetRequest = this.getFacetRequest(facetId);
    const facetField = facetRequest?.field ?? '';
    return {
      ...this.getBaseMetadata(),
      facetId,
      facetField,
      facetValue,
      facetTitle: `${facetField}_${facetId}`,
    };
  }

  public getFacetClearAllMetadata(facetId: string) {
    const facetRequest = this.getFacetRequest(facetId);
    const facetField = facetRequest?.field ?? '';
    return {
      ...this.getBaseMetadata(),
      facetId,
      facetField,
      facetTitle: `${facetField}_${facetId}`,
    };
  }

  public getFacetUpdateSortMetadata(
    facetId: string,
    criteria: FacetSortCriterion | RangeFacetSortCriterion
  ) {
    const facetRequest = this.getFacetRequest(facetId);
    const facetField = facetRequest?.field ?? '';
    return {
      ...this.getBaseMetadata(),
      facetId,
      facetField,
      criteria,
      facetTitle: `${facetField}_${facetId}`,
    };
  }

  public getRangeBreadcrumbFacetMetadata(
    facetId: string,
    facetValue: DateFacetValue | NumericFacetValue
  ) {
    const facetRequest = this.getFacetRequest(facetId);
    const facetField = facetRequest?.field ?? '';
    return {
      ...this.getBaseMetadata(),
      facetId,
      facetField,
      facetRangeEnd: facetValue.end,
      facetRangeEndInclusive: facetValue.endInclusive,
      facetRangeStart: facetValue.start,
      facetTitle: `${facetField}_${facetId}`,
    };
  }

  private getFacetRequest = (id: string) => {
    return (
      this.state.facetSet?.[id]?.request ||
      this.state.categoryFacetSet?.[id]?.request ||
      this.state.dateFacetSet?.[id]?.request ||
      this.state.numericFacetSet?.[id]?.request ||
      this.state.automaticFacetSet?.set[id]?.response
    );
  };

  public getResultSortMetadata() {
    return {
      ...this.getBaseMetadata(),
      resultsSortBy: this.state.sortCriteria ?? getSortCriteriaInitialState(),
    };
  }

  public getStaticFilterToggleMetadata(
    staticFilterId: string,
    staticFilterValue: StaticFilterValueMetadata
  ) {
    return {
      ...this.getBaseMetadata(),
      staticFilterId,
      staticFilterValue,
    };
  }

  public getStaticFilterClearAllMetadata(staticFilterId: string) {
    return {
      ...this.getBaseMetadata(),
      staticFilterId,
    };
  }

  public getUndoTriggerQueryMetadata(undoneQuery: string) {
    return {
      ...this.getBaseMetadata(),
      undoneQuery,
    };
  }

  public getCategoryBreadcrumbFacetMetadata(
    categoryFacetId: string,
    categoryFacetPath: string[]
  ) {
    const facetRequest = this.getFacetRequest(categoryFacetId);
    const categoryFacetField = facetRequest?.field ?? '';
    return {
      ...this.getBaseMetadata(),
      categoryFacetId,
      categoryFacetField,
      categoryFacetPath,
      categoryFacetTitle: `${categoryFacetField}_${categoryFacetId}`,
    };
  }

  public getOmniboxAnalyticsMetadata(id: string, suggestion: string) {
    const querySuggest = this.state.querySuggest && this.state.querySuggest[id];
    const suggestions = querySuggest!.completions.map(
      (completion) => completion.expression
    );

    const lastIndex = querySuggest!.partialQueries.length - 1;
    const partialQuery = querySuggest!.partialQueries[lastIndex] || '';
    const querySuggestResponseId = querySuggest!.responseId;
    return {
      ...this.getBaseMetadata(),
      suggestionRanking: suggestions.indexOf(suggestion),
      partialQuery,
      partialQueries:
        querySuggest!.partialQueries.length > 0
          ? querySuggest!.partialQueries
          : '',
      suggestions: suggestions.length > 0 ? suggestions : '',
      querySuggestResponseId,
    };
  }

  public getInterfaceChangeMetadata() {
    return {
      ...this.getBaseMetadata(),
      interfaceChangeTo: this.state.configuration.analytics.originLevel2,
    };
  }

  public getOmniboxFromLinkMetadata(metadata: OmniboxSuggestionMetadata) {
    return {
      ...this.getBaseMetadata(),
      ...metadata,
    };
  }

  public getGeneratedAnswerMetadata() {
    const state = this.getState();
    const formattedObject: Record<string, string | boolean> = {};
    if (state.generatedAnswer?.isVisible !== undefined) {
      formattedObject['showGeneratedAnswer'] = state.generatedAnswer.isVisible;
    }
    return formattedObject;
  }

  private get resultURIs() {
    return this.results?.map((r) => ({
      documentUri: r.uri,
      documentUriHash: r.raw.urihash,
    }));
  }

  protected get results() {
    return this.state.search?.response.results;
  }

  protected get queryText() {
    return this.state.query?.q || getQueryInitialState().q;
  }

  protected get responseTime() {
    return this.state.search?.duration || getSearchInitialState().duration;
  }

  protected get numberOfResults() {
    return (
      this.state.search?.response.totalCountFiltered ||
      getSearchInitialState().response.totalCountFiltered
    );
  }
}

interface LegacyConfigureAnalyticsOptions {
  logger: Logger;
  analyticsClientMiddleware?: AnalyticsClientSendEventHook;
  preprocessRequest?: PreprocessRequest;
  provider?: SearchPageClientProvider;
  getState(): StateNeededBySearchAnalyticsProvider;
}

//TODO: KIT-2859
export const configureLegacyAnalytics = ({
  logger,
  getState,
  analyticsClientMiddleware = (_, p) => p,
  preprocessRequest,
  provider = new SearchAnalyticsProvider(getState),
}: LegacyConfigureAnalyticsOptions) => {
  const state = getState();
  const token = state.configuration.accessToken;
  const endpoint =
    state.configuration.analytics.apiBaseUrl ??
    getOrganizationEndpoint(
      state.configuration.organizationId,
      state.configuration.environment,
      'analytics'
    );
  const runtimeEnvironment = state.configuration.analytics.runtimeEnvironment;
  const enableAnalytics = state.configuration.analytics.enabled;
  const client = new CoveoSearchPageClient(
    {
      token,
      endpoint,
      runtimeEnvironment,
      preprocessRequest: wrapPreprocessRequest(logger, preprocessRequest),
      beforeSendHooks: [
        wrapAnalyticsClientSendEventHook(logger, analyticsClientMiddleware),
        (type, payload) => {
          logger.info(
            {
              ...payload,
              type,
              endpoint,
              token,
            },
            'Analytics request'
          );
          return payload;
        },
      ],
    },
    provider
  );

  if (!enableAnalytics) {
    client.disable();
  }
  return client;
};

export const getPageID = () => {
  const actions = historyStore.getHistory();
  const lastPageView = actions.reverse().find((action) => {
    return action.name === 'PageView' && action.value;
  });

  if (!lastPageView) {
    return '';
  }

  return lastPageView.value!;
};
