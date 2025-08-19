import {createSelector} from '@reduxjs/toolkit';
import {
  type AnswerEvaluationPOSTParams,
  answerEvaluation,
} from '../../../api/knowledge/post-answer-evaluation.js';
import {triggerSearchRequest} from '../../../api/knowledge/stream-answer-actions.js';
import {
  answerApi,
  fetchAnswer,
  type GeneratedAnswerStream,
  type StateNeededByAnswerAPI,
  selectAnswer,
} from '../../../api/knowledge/stream-answer-api.js';
import {warnIfUsingNextAnalyticsModeForServiceFeature} from '../../../app/engine.js';
import type {InsightEngine} from '../../../app/insight-engine/insight-engine.js';
import {
  defaultNodeJSNavigatorContextProvider,
  type NavigatorContext,
} from '../../../app/navigator-context-provider.js';
import type {SearchEngine} from '../../../app/search-engine/search-engine.js';
import {selectAdvancedSearchQueries} from '../../../features/advanced-search-queries/advanced-search-query-selectors.js';
import {fromAnalyticsStateToAnalyticsParams} from '../../../features/configuration/analytics-params.js';
import {selectContext} from '../../../features/context/context-selector.js';
import {
  resetAnswer,
  sendGeneratedAnswerFeedback,
  setCannotAnswer,
  updateAnswerConfigurationId,
} from '../../../features/generated-answer/generated-answer-actions.js';
import type {GeneratedAnswerFeedback} from '../../../features/generated-answer/generated-answer-analytics-actions.js';
import {selectFieldsToIncludeInCitation} from '../../../features/generated-answer/generated-answer-selectors.js';
import {filterOutDuplicatedCitations} from '../../../features/generated-answer/utils/generated-answer-citation-utils.js';
import {maximumNumberOfResultsFromIndex} from '../../../features/pagination/pagination-constants.js';
import {selectPipeline} from '../../../features/pipeline/select-pipeline.js';
import {selectQuery} from '../../../features/query/query-selectors.js';
import {queryReducer as query} from '../../../features/query/query-slice.js';
import {
  initialSearchMappings,
  mapFacetRequest,
} from '../../../features/search/search-mappings.js';
import {selectSearchActionCause} from '../../../features/search/search-selectors.js';
import {selectSearchHub} from '../../../features/search-hub/search-hub-selectors.js';
import {selectStaticFilterExpressions} from '../../../features/static-filter-set/static-filter-set-selectors.js';
import {
  selectActiveTab,
  selectActiveTabExpression,
} from '../../../features/tab-set/tab-set-selectors.js';
import type {
  GeneratedAnswerSection,
  QuerySection,
} from '../../../state/state-sections.js';
import {loadReducerError} from '../../../utils/errors.js';
import {getFacets} from '../../../utils/facet-utils.js';
import {
  buildCoreGeneratedAnswer,
  type GeneratedAnswer,
  type GeneratedAnswerAnalyticsClient,
  type GeneratedAnswerProps,
} from '../../core/generated-answer/headless-core-generated-answer.js';

interface AnswerApiGeneratedAnswer
  extends Omit<GeneratedAnswer, 'sendFeedback'> {
  /**
   * Resets the last answer.
   */
  reset(): void;
  /**
   * Sends feedback about why the generated answer was not relevant.
   * @param feedback - The feedback that the end user wishes to send.
   */
  sendFeedback(feedback: GeneratedAnswerFeedback): void;
}

interface AnswerApiGeneratedAnswerProps extends GeneratedAnswerProps {}

interface SearchAPIGeneratedAnswerAnalyticsClient
  extends GeneratedAnswerAnalyticsClient {}

interface ParseEvaluationArgumentsParams {
  feedback: GeneratedAnswerFeedback;
  answerApiState: GeneratedAnswerStream;
  query: string;
}

const parseEvaluationDetails = (
  detail: 'yes' | 'no' | 'unknown'
): boolean | null => {
  if (detail === 'yes') {
    return true;
  }
  if (detail === 'no') {
    return false;
  }
  return null;
};

const parseEvaluationArguments = ({
  answerApiState,
  feedback,
  query,
}: ParseEvaluationArgumentsParams): AnswerEvaluationPOSTParams => ({
  additionalNotes: feedback.details ?? null,
  answer: {
    text: answerApiState.answer!,
    responseId: answerApiState.answerId!,
    format: answerApiState.contentFormat ?? 'text/plain',
  },
  correctAnswerUrl: feedback.documentUrl ?? null,
  details: {
    correctTopic: parseEvaluationDetails(feedback.correctTopic),
    documented: parseEvaluationDetails(feedback.documented),
    hallucinationFree: parseEvaluationDetails(feedback.hallucinationFree),
    readable: parseEvaluationDetails(feedback.readable),
  },
  helpful: feedback.helpful,
  question: query,
});

const subscribeToSearchRequest = (
  engine: SearchEngine<StateNeededByAnswerAPI>
) => {
  let lastTriggerParams: ReturnType<typeof selectAnswerTriggerParams>;
  const strictListener = () => {
    const state = engine.state;
    const triggerParams = selectAnswerTriggerParams(state);

    if (!lastTriggerParams || triggerParams.q.length === 0) {
      lastTriggerParams = triggerParams;
    }

    if (triggerParams.q.length === 0 && !!triggerParams.cannotAnswer) {
      engine.dispatch(setCannotAnswer(false));
    }

    if (
      triggerParams.q.length === 0 ||
      triggerParams.requestId.length === 0 ||
      triggerParams.requestId === lastTriggerParams.requestId ||
      (triggerParams.analyticsMode === 'next' && !triggerParams.actionCause) // If analytics mode is next, we need to wait for the action cause to be set
    ) {
      return;
    }

    lastTriggerParams = triggerParams;
    // Every time a new search request is triggered, we re-calculate the answer query params
    const cachedAnswerParams = constructAnswerQueryParams(
      state,
      engine.navigatorContext || defaultNodeJSNavigatorContextProvider
    );
    engine.dispatch(
      triggerSearchRequest({fetchAnswerParams: cachedAnswerParams})
    );
  };

  engine.subscribe(strictListener);
};

/**
 *
 * @internal
 *
 * Creates a `AnswerApiGeneratedAnswer` controller instance using the Answer API stream pattern.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `AnswerApiGeneratedAnswer` properties.
 * @returns A `AnswerApiGeneratedAnswer` controller instance.
 */
export function buildAnswerApiGeneratedAnswer(
  engine: SearchEngine | InsightEngine,
  analyticsClient: SearchAPIGeneratedAnswerAnalyticsClient,
  props: AnswerApiGeneratedAnswerProps = {}
): AnswerApiGeneratedAnswer {
  if (!loadAnswerApiReducers(engine)) {
    throw loadReducerError;
  }
  warnIfUsingNextAnalyticsModeForServiceFeature(
    engine.state.configuration.analytics.analyticsMode
  );

  const {...controller} = buildCoreGeneratedAnswer(
    engine,
    analyticsClient,
    props
  );
  const getState = () => engine.state;
  engine.dispatch(updateAnswerConfigurationId(props.answerConfigurationId!));

  subscribeToSearchRequest(engine as SearchEngine<StateNeededByAnswerAPI>);

  return {
    ...controller,
    get state() {
      const answerApiState = selectAnswer(engine.state).data;
      return {
        ...getState().generatedAnswer,
        answer: answerApiState?.answer,
        citations: filterOutDuplicatedCitations(
          answerApiState?.citations ?? []
        ),
        error: {
          message: answerApiState?.error?.message,
          statusCode: answerApiState?.error?.code,
        },
        isLoading: answerApiState?.isLoading ?? false,
        isStreaming: answerApiState?.isStreaming ?? false,
        answerContentFormat: answerApiState?.contentFormat ?? 'text/plain',
        isAnswerGenerated: answerApiState?.generated ?? false,
      };
    },
    retry() {
      const params = getState().generatedAnswer.answerApiQueryParams;
      if (params) {
        engine.dispatch(fetchAnswer(params));
      }
    },
    reset() {
      engine.dispatch(resetAnswer());
    },
    async sendFeedback(feedback) {
      const args = parseEvaluationArguments({
        query: getState().query.q,
        feedback,
        answerApiState: selectAnswer(engine.state).data!,
      });
      engine.dispatch(answerEvaluation.endpoints.post.initiate(args));
      engine.dispatch(sendGeneratedAnswerFeedback());
    },
  };
}

function loadAnswerApiReducers(
  engine: SearchEngine | InsightEngine
): engine is SearchEngine<
  GeneratedAnswerSection &
    QuerySection & {answer: ReturnType<typeof answerApi.reducer>}
> {
  engine.addReducers({[answerApi.reducerPath]: answerApi.reducer, query});
  return true;
}

const buildAdvancedSearchQueryParams = (state: StateNeededByAnswerAPI) => {
  const advancedSearchQueryParams = selectAdvancedSearchQueries(state);
  const mergedCq = mergeAdvancedCQParams(state);

  return {
    ...advancedSearchQueryParams,
    ...(mergedCq && {cq: mergedCq}),
  };
};

const mergeAdvancedCQParams = (state: StateNeededByAnswerAPI) => {
  const activeTabExpression = selectActiveTabExpression(state.tabSet);
  const filterExpressions = selectStaticFilterExpressions(state);
  const {cq} = selectAdvancedSearchQueries(state);

  return [activeTabExpression, ...filterExpressions, cq]
    .filter((expression) => !!expression)
    .join(' AND ');
};

const getNumberOfResultsWithinIndexLimit = (state: StateNeededByAnswerAPI) => {
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

export const constructAnswerQueryParams = (
  state: StateNeededByAnswerAPI,
  navigatorContext: NavigatorContext
) => {
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

  return {
    q,
    ...(aq && {aq}),
    ...(cq && {cq}),
    ...(dq && {dq}),
    ...(lq && {lq}),
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
    // Passing facets
    ...(Object.keys(facetParams).length && {facets: facetParams}),
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
    tab: selectActiveTab(state.tabSet),
    ...analyticsParams,
  };
};

const getGeneratedFacetParams = (state: StateNeededByAnswerAPI) => ({
  ...getFacets(state)
    ?.map((facetRequest) =>
      mapFacetRequest(facetRequest, initialSearchMappings())
    )
    .sort((a, b) =>
      a.facetId > b.facetId ? 1 : b.facetId > a.facetId ? -1 : 0
    ),
});

const selectAnswerTriggerParams = createSelector(
  (state) => selectQuery(state)?.q,
  (state) => state.search.requestId,
  (state) => state.generatedAnswer.cannotAnswer,
  (state) => state.configuration.analytics.analyticsMode,
  (state) => state.search.searchAction?.actionCause,
  (q, requestId, cannotAnswer, analyticsMode, actionCause) => ({
    q,
    requestId,
    cannotAnswer,
    analyticsMode,
    actionCause,
  })
);
