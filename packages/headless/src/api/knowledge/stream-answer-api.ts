import {
  EventSourceMessage,
  fetchEventSource,
} from '@microsoft/fetch-event-source';
import {createSelector, ThunkDispatch, UnknownAction} from '@reduxjs/toolkit';
import {
  setAnswerContentFormat,
  setCannotAnswer,
  updateCitations,
  updateMessage,
} from '../../features/generated-answer/generated-answer-actions.js';
import {logGeneratedAnswerStreamEnd} from '../../features/generated-answer/generated-answer-analytics-actions.js';
import {selectFieldsToIncludeInCitation} from '../../features/generated-answer/generated-answer-selectors.js';
import {GeneratedContentFormat} from '../../features/generated-answer/generated-response-format.js';
import {maximumNumberOfResultsFromIndex} from '../../features/pagination/pagination-constants.js';
import {selectPipeline} from '../../features/pipeline/select-pipeline.js';
import {selectQuery} from '../../features/query/query-selectors.js';
import {selectSearchHub} from '../../features/search-hub/search-hub-selectors.js';
import {
  initialSearchMappings,
  mapFacetRequest,
} from '../../features/search/search-mappings.js';
import {SearchAppState} from '../../state/search-app-state.js';
import {
  ConfigurationSection,
  GeneratedAnswerSection,
  InsightConfigurationSection,
} from '../../state/state-sections.js';
import {getFacets} from '../../utils/facet-utils.js';
import {GeneratedAnswerCitation} from '../generated-answer/generated-answer-event-payload.js';
import {getOrganizationEndpoint} from '../platform-client.js';
import {SearchRequest} from '../search/search/search-request.js';
import {answerSlice} from './answer-slice.js';

export type StateNeededByAnswerAPI = {
  searchHub: string;
  pipeline: string;
  answer: ReturnType<typeof answerApi.reducer>;
} & ConfigurationSection &
  Partial<SearchAppState> &
  Partial<InsightConfigurationSection> &
  GeneratedAnswerSection;

export interface GeneratedAnswerStream {
  answerId?: string;
  contentFormat?: GeneratedContentFormat;
  answer?: string;
  citations?: GeneratedAnswerCitation[];
  generated?: boolean;
  isStreaming: boolean;
  isLoading: boolean;
  error?: {message: string; code: number};
}

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
  dispatch: ThunkDispatch<StateNeededByAnswerAPI, unknown, UnknownAction>
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
          getState() as unknown as StateNeededByAnswerAPI;
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
  (q, requestId) => ({q, requestId})
);

let generateFacetParams: Record<string, ReturnType<typeof getFacets>> = {};

const getGeneratedFacetParams = (q: string, state: StateNeededByAnswerAPI) => ({
  ...generateFacetParams,
  [q]: getFacets(state)
    ?.map((facetRequest) =>
      mapFacetRequest(facetRequest, initialSearchMappings())
    )
    .sort((a, b) =>
      a.facetId > b.facetId ? 1 : b.facetId > a.facetId ? -1 : 0
    ),
});

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
  usage: 'fetch' | 'select'
) => {
  const q = selectQuery(state)?.q;
  const searchHub = selectSearchHub(state);
  const pipeline = selectPipeline(state);
  const citationsFieldToInclude = selectFieldsToIncludeInCitation(state) ?? [];

  if (q && usage === 'fetch') {
    generateFacetParams = getGeneratedFacetParams(q, state);
  }

  return {
    q,
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
    tab: state.configuration.analytics.originLevel2,
  };
};

export const fetchAnswer = (state: StateNeededByAnswerAPI) =>
  answerApi.endpoints.getAnswer.initiate(
    constructAnswerQueryParams(state, 'fetch')
  );

export const selectAnswer = (state: StateNeededByAnswerAPI) =>
  answerApi.endpoints.getAnswer.select(
    constructAnswerQueryParams(state, 'select')
  )(state);
