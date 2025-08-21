import {
  createSelector,
  type ThunkDispatch,
  type UnknownAction,
} from '@reduxjs/toolkit';
import {
  defaultNodeJSNavigatorContextProvider,
  type NavigatorContext,
} from '../../app/navigator-context-provider.js';
import {selectAdvancedSearchQueries} from '../../features/advanced-search-queries/advanced-search-query-selectors.js';
import {fromAnalyticsStateToAnalyticsParams} from '../../features/configuration/analytics-params.js';
import {selectContext} from '../../features/context/context-selector.js';
import {
  setAnswerContentFormat,
  setCannotAnswer,
  updateCitations,
  updateMessage,
} from '../../features/generated-answer/generated-answer-actions.js';
import {logGeneratedAnswerStreamEnd} from '../../features/generated-answer/generated-answer-analytics-actions.js';
import {selectFieldsToIncludeInCitation} from '../../features/generated-answer/generated-answer-selectors.js';
import {maximumNumberOfResultsFromIndex} from '../../features/pagination/pagination-constants.js';
import {selectPipeline} from '../../features/pipeline/select-pipeline.js';
import {selectQuery} from '../../features/query/query-selectors.js';
import {
  initialSearchMappings,
  mapFacetRequest,
} from '../../features/search/search-mappings.js';
import {selectSearchActionCause} from '../../features/search/search-selectors.js';
import {selectSearchHub} from '../../features/search-hub/search-hub-selectors.js';
import {selectStaticFilterExpressions} from '../../features/static-filter-set/static-filter-set-selectors.js';
import {
  selectActiveTab,
  selectActiveTabExpression,
} from '../../features/tab-set/tab-set-selectors.js';
import {getFacets} from '../../utils/facet-utils.js';
import {fetchEventSource} from '../../utils/fetch-event-source/fetch.js';
import type {EventSourceMessage} from '../../utils/fetch-event-source/parse.js';
import {getOrganizationEndpoint} from '../platform-client.js';
import type {SearchRequest} from '../search/search/search-request.js';
import {answerSlice} from './answer-slice.js';
import type {GeneratedAnswerStream} from './generated-answer-stream.js';
import type {StreamAnswerAPIState} from './stream-answer-api-state.js';

interface StreamPayload
  extends Pick<GeneratedAnswerStream, 'contentFormat' | 'citations'> {
  textDelta?: string;
  padding?: string;
  answerGenerated?: boolean;
}

type PayloadType =
  | 'genqa.headerMessageType'
  | 'genqa.messageType'
  | 'genqa.citationsType'
  | 'genqa.endOfStreamType';

const handleHeaderMessage = (
  draft: GeneratedAnswerStream,
  payload: Pick<GeneratedAnswerStream, 'contentFormat'>
) => {
  const {contentFormat} = payload;
  draft.contentFormat = contentFormat;
  draft.isStreaming = true;
  draft.isLoading = false;
};

const handleMessage = (
  draft: GeneratedAnswerStream,
  payload: Pick<StreamPayload, 'textDelta'>
) => {
  if (draft.answer === undefined) {
    draft.answer = payload.textDelta;
  } else if (typeof payload.textDelta === 'string') {
    draft.answer = draft.answer.concat(payload.textDelta);
  }
};

const handleCitations = (
  draft: GeneratedAnswerStream,
  payload: Pick<StreamPayload, 'citations'>
) => {
  draft.citations = payload.citations;
};

const handleEndOfStream = (
  draft: GeneratedAnswerStream,
  payload: Pick<StreamPayload, 'answerGenerated'>
) => {
  draft.generated = payload.answerGenerated;
  draft.isStreaming = false;
};

interface MessageType {
  payloadType: PayloadType;
  payload: string;
  finishReason?: string;
  errorMessage?: string;
  code?: number;
}

const handleError = (
  draft: GeneratedAnswerStream,
  message: Required<MessageType>
) => {
  draft.error = {
    message: message.errorMessage,
    code: message.code!,
  };
  draft.isStreaming = false;
  draft.isLoading = false;
  // Throwing an error here breaks the client and prevents the error from reaching the state.
  console.error(`${message.errorMessage} - code ${message.code}`);
};

export const updateCacheWithEvent = (
  event: EventSourceMessage,
  draft: GeneratedAnswerStream,
  dispatch: ThunkDispatch<StreamAnswerAPIState, unknown, UnknownAction>
) => {
  const message: Required<MessageType> = JSON.parse(event.data);
  if (message.finishReason === 'ERROR' && message.errorMessage) {
    handleError(draft, message);
  }

  const parsedPayload: StreamPayload = message.payload.length
    ? JSON.parse(message.payload)
    : {};

  switch (message.payloadType) {
    case 'genqa.headerMessageType':
      if (parsedPayload.contentFormat) {
        handleHeaderMessage(draft, parsedPayload);
        dispatch(setAnswerContentFormat(parsedPayload.contentFormat));
      }
      break;
    case 'genqa.messageType':
      if (parsedPayload.textDelta) {
        handleMessage(draft, parsedPayload);
        dispatch(updateMessage({textDelta: parsedPayload.textDelta}));
      }
      break;
    case 'genqa.citationsType':
      if (parsedPayload.citations) {
        handleCitations(draft, parsedPayload);
        dispatch(updateCitations({citations: parsedPayload.citations}));
      }
      break;
    case 'genqa.endOfStreamType':
      handleEndOfStream(draft, parsedPayload);
      dispatch(
        logGeneratedAnswerStreamEnd(parsedPayload.answerGenerated ?? false)
      );
      break;
  }
};

export const answerApi = answerSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAnswer: builder.query<GeneratedAnswerStream, Partial<SearchRequest>>({
      queryFn: () => ({
        data: {
          contentFormat: undefined,
          answer: undefined,
          citations: undefined,
          error: undefined,
          generated: false,
          isStreaming: true,
          isLoading: true,
        },
      }),
      serializeQueryArgs: ({endpointName, queryArgs}) => {
        // RTK Query serialize our endpoints and they're serialized state arguments as the key in the store.
        // Keys must match, because if anything in the query changes, it's not the same query anymore.
        // Analytics data is excluded entirely as it contains volatile fields that change during streaming.
        const {analytics: _analytics, ...queryArgsWithoutAnalytics} = queryArgs;

        // Standard RTK key, with analytics excluded
        return `${endpointName}(${JSON.stringify(queryArgsWithoutAnalytics)})`;
      },
      async onCacheEntryAdded(
        args,
        {getState, cacheDataLoaded, updateCachedData, dispatch}
      ) {
        await cacheDataLoaded;
        /**
         * createApi has to be called prior to creating the redux store and is used as part of the store setup sequence.
         * It cannot use the inferred state used by Redux, thus the casting.
         * https://redux-toolkit.js.org/rtk-query/usage-with-typescript#typing-dispatch-and-getstate
         */
        const {configuration, generatedAnswer, insightConfiguration} =
          getState() as unknown as StreamAnswerAPIState;
        const {organizationId, environment, accessToken} = configuration;
        const platformEndpoint = getOrganizationEndpoint(
          organizationId,
          environment
        );
        const insightGenerateEndpoint = `${platformEndpoint}/rest/organizations/${organizationId}/insight/v1/configs/${insightConfiguration?.insightId}/answer/${generatedAnswer.answerConfigurationId}/generate`;
        const generateEndpoint = `${platformEndpoint}/rest/organizations/${organizationId}/answer/v1/configs/${generatedAnswer.answerConfigurationId}/generate`;
        await fetchEventSource(
          insightConfiguration ? insightGenerateEndpoint : generateEndpoint,
          {
            method: 'POST',
            body: JSON.stringify(args),
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'Accept-Encoding': '*',
            },
            fetch,
            onopen: async (res) => {
              const answerId = res.headers.get('x-answer-id');
              if (answerId) {
                updateCachedData((draft) => {
                  draft.answerId = answerId;
                });
              }
            },
            onmessage: (event) => {
              updateCachedData((draft) => {
                updateCacheWithEvent(event, draft, dispatch);
              });
            },
            onerror: (error) => {
              throw error;
            },
            onclose: () => {
              updateCachedData((draft) => {
                dispatch(setCannotAnswer(!draft.generated));
              });
            },
          }
        );
      },
    }),
  }),
});

export const selectAnswerTriggerParams = createSelector(
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

let generateFacetParams: Record<string, ReturnType<typeof getFacets>> = {};

const getGeneratedFacetParams = (q: string, state: StreamAnswerAPIState) => ({
  ...generateFacetParams,
  [q]: getFacets(state)
    ?.map((facetRequest) =>
      mapFacetRequest(facetRequest, initialSearchMappings())
    )
    .sort((a, b) =>
      a.facetId > b.facetId ? 1 : b.facetId > a.facetId ? -1 : 0
    ),
});

const getNumberOfResultsWithinIndexLimit = (state: StreamAnswerAPIState) => {
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

const buildAdvancedSearchQueryParams = (state: StreamAnswerAPIState) => {
  const advancedSearchQueryParams = selectAdvancedSearchQueries(state);
  const mergedCq = mergeAdvancedCQParams(state);

  return {
    ...advancedSearchQueryParams,
    ...(mergedCq && {cq: mergedCq}),
  };
};

const mergeAdvancedCQParams = (state: StreamAnswerAPIState) => {
  const activeTabExpression = selectActiveTabExpression(state.tabSet);
  const filterExpressions = selectStaticFilterExpressions(state);
  const {cq} = selectAdvancedSearchQueries(state);

  return [activeTabExpression, ...filterExpressions, cq]
    .filter((expression) => !!expression)
    .join(' AND ');
};

export const constructAnswerQueryParams = (
  state: StreamAnswerAPIState,
  usage: 'fetch' | 'select',
  navigatorContext: NavigatorContext
) => {
  const q = selectQuery(state)?.q;

  const {aq, cq, dq, lq} = buildAdvancedSearchQueryParams(state);

  const context = selectContext(state);

  // For 'select' usage, exclude volatile analytics fields to match serializeQueryArgs behavior
  const analyticsParams =
    usage === 'select'
      ? {}
      : fromAnalyticsStateToAnalyticsParams(
          state.configuration.analytics,
          navigatorContext,
          {actionCause: selectSearchActionCause(state)}
        );

  const searchHub = selectSearchHub(state);
  const pipeline = selectPipeline(state);
  const citationsFieldToInclude = selectFieldsToIncludeInCitation(state) ?? [];

  if (q && usage === 'fetch') {
    generateFacetParams = getGeneratedFacetParams(q, state);
  }

  return {
    q,
    ...(aq && {aq}),
    ...(cq && {cq}),
    ...(dq && {dq}),
    ...(lq && {lq}),
    ...(state.query && {enableQuerySyntax: state.query.enableQuerySyntax}),
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
    ...(generateFacetParams[q!]?.length && {
      facets: generateFacetParams[q!],
    }),
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

export const fetchAnswer = (
  state: StreamAnswerAPIState,
  navigatorContext: NavigatorContext
) =>
  answerApi.endpoints.getAnswer.initiate(
    constructAnswerQueryParams(state, 'fetch', navigatorContext)
  );

export const selectAnswer = (
  state: StreamAnswerAPIState,
  navigatorContext?: NavigatorContext
) =>
  answerApi.endpoints.getAnswer.select(
    constructAnswerQueryParams(
      state,
      'select',
      navigatorContext || defaultNodeJSNavigatorContextProvider()
    )
  )(state);
