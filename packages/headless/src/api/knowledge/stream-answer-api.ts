import {
  EventSourceMessage,
  fetchEventSource,
} from '@microsoft/fetch-event-source';
import {createSelector, ThunkDispatch, UnknownAction} from '@reduxjs/toolkit';
import {
  setAnswerContentFormat,
  updateCitations,
  updateMessage,
} from '../../features/generated-answer/generated-answer-actions';
import {logGeneratedAnswerStreamEnd} from '../../features/generated-answer/generated-answer-analytics-actions';
import {selectFieldsToIncludeInCitation} from '../../features/generated-answer/generated-answer-selectors';
import {
  GeneratedAnswerStyle,
  GeneratedContentFormat,
} from '../../features/generated-answer/generated-response-format';
import {maximumNumberOfResultsFromIndex} from '../../features/pagination/pagination-constants';
import {selectPipeline} from '../../features/pipeline/select-pipeline';
import {selectQuery} from '../../features/query/query-selectors';
import {selectSearchHub} from '../../features/search-hub/search-hub-selectors';
import {
  initialSearchMappings,
  mapFacetRequest,
} from '../../features/search/search-mappings';
import {SearchAppState} from '../../state/search-app-state';
import {
  ConfigurationSection,
  GeneratedAnswerSection,
} from '../../state/state-sections';
import {getFacets} from '../../utils/facet-utils';
import {GeneratedAnswerCitation} from '../generated-answer/generated-answer-event-payload';
import {SearchRequest} from '../search/search/search-request';
import {answerSlice} from './answer-slice';

export type StateNeededByAnswerAPI = {
  searchHub: string;
  pipeline: string;
  answer: ReturnType<typeof answerApi.reducer>;
} & ConfigurationSection &
  Partial<SearchAppState> &
  GeneratedAnswerSection;

export interface GeneratedAnswerStream {
  answerId?: string;
  answerStyle?: GeneratedAnswerStyle;
  contentFormat?: GeneratedContentFormat;
  answer?: string;
  citations?: GeneratedAnswerCitation[];
  generated?: boolean;
  isStreaming: boolean;
  isLoading: boolean;
  error?: {message: string; code: number};
}

interface StreamPayload
  extends Pick<
    GeneratedAnswerStream,
    'answerStyle' | 'contentFormat' | 'citations'
  > {
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
  payload: Pick<GeneratedAnswerStream, 'answerStyle' | 'contentFormat'>
) => {
  const {answerStyle, contentFormat} = payload;
  draft.answerStyle = answerStyle;
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
      if (parsedPayload.answerStyle && parsedPayload.contentFormat) {
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
          answerStyle: undefined,
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
        const {configuration, generatedAnswer} =
          getState() as unknown as StateNeededByAnswerAPI;
        const {platformUrl, organizationId, accessToken} = configuration;
        await fetchEventSource(
          `${platformUrl}/rest/organizations/${organizationId}/answer/v1/configs/${generatedAnswer.answerConfigurationId}/generate`,
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
